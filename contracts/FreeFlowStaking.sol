// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FreeFlowStaking
 * @dev Staking contract for Free Flow tokens with rewards
 * @author Free Flow Team
 */
contract FreeFlowStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewardDebt;
    }

    struct PoolInfo {
        IERC20 stakingToken;
        uint256 rewardRate;
        uint256 totalStaked;
        uint256 lastUpdateTime;
        uint256 accRewardPerShare;
    }

    // Events
    event Staked(address indexed user, uint256 amount, uint256 poolId);
    event Unstaked(address indexed user, uint256 amount, uint256 poolId);
    event RewardClaimed(address indexed user, uint256 amount, uint256 poolId);
    event PoolAdded(uint256 poolId, address stakingToken, uint256 rewardRate);
    event PoolUpdated(uint256 poolId, uint256 newRewardRate);

    // State variables
    mapping(uint256 => PoolInfo) public pools;
    mapping(address => mapping(uint256 => StakingInfo)) public userStaking;
    mapping(address => uint256[]) public userPools;
    
    uint256 public poolCount;
    uint256 public constant REWARD_PRECISION = 1e12;

    modifier validPool(uint256 _poolId) {
        require(_poolId < poolCount, "Invalid pool ID");
        _;
    }

    constructor() {}

    function addPool(address _stakingToken, uint256 _rewardRate) external onlyOwner {
        require(_stakingToken != address(0), "Invalid token address");
        require(_rewardRate > 0, "Invalid reward rate");

        pools[poolCount] = PoolInfo({
            stakingToken: IERC20(_stakingToken),
            rewardRate: _rewardRate,
            totalStaked: 0,
            lastUpdateTime: block.timestamp,
            accRewardPerShare: 0
        });

        emit PoolAdded(poolCount, _stakingToken, _rewardRate);
        poolCount++;
    }

    function updatePool(uint256 _poolId, uint256 _newRewardRate) external onlyOwner validPool(_poolId) {
        updatePoolRewards(_poolId);
        pools[_poolId].rewardRate = _newRewardRate;
        emit PoolUpdated(_poolId, _newRewardRate);
    }

    function stake(uint256 _poolId, uint256 _amount) external nonReentrant validPool(_poolId) {
        require(_amount > 0, "Amount must be greater than 0");
        
        updatePoolRewards(_poolId);
        updateUserRewards(msg.sender, _poolId);

        IERC20(pools[_poolId].stakingToken).safeTransferFrom(msg.sender, address(this), _amount);

        if (userStaking[msg.sender][_poolId].amount == 0) {
            userPools[msg.sender].push(_poolId);
        }

        userStaking[msg.sender][_poolId].amount += _amount;
        userStaking[msg.sender][_poolId].startTime = block.timestamp;
        userStaking[msg.sender][_poolId].lastClaimTime = block.timestamp;

        pools[_poolId].totalStaked += _amount;

        emit Staked(msg.sender, _amount, _poolId);
    }

    function unstake(uint256 _poolId, uint256 _amount) external nonReentrant validPool(_poolId) {
        require(_amount > 0, "Amount must be greater than 0");
        require(userStaking[msg.sender][_poolId].amount >= _amount, "Insufficient staked amount");

        updatePoolRewards(_poolId);
        updateUserRewards(msg.sender, _poolId);

        userStaking[msg.sender][_poolId].amount -= _amount;
        pools[_poolId].totalStaked -= _amount;

        IERC20(pools[_poolId].stakingToken).safeTransfer(msg.sender, _amount);

        if (userStaking[msg.sender][_poolId].amount == 0) {
            removeUserPool(msg.sender, _poolId);
        }

        emit Unstaked(msg.sender, _amount, _poolId);
    }

    function claimRewards(uint256 _poolId) external nonReentrant validPool(_poolId) {
        updatePoolRewards(_poolId);
        updateUserRewards(msg.sender, _poolId);

        uint256 pendingRewards = userStaking[msg.sender][_poolId].rewardDebt;
        require(pendingRewards > 0, "No rewards to claim");

        userStaking[msg.sender][_poolId].rewardDebt = 0;
        userStaking[msg.sender][_poolId].lastClaimTime = block.timestamp;

        // Transfer rewards (assuming FLOW token)
        payable(msg.sender).transfer(pendingRewards);

        emit RewardClaimed(msg.sender, pendingRewards, _poolId);
    }

    function updatePoolRewards(uint256 _poolId) internal {
        PoolInfo storage pool = pools[_poolId];
        if (block.timestamp <= pool.lastUpdateTime) return;

        if (pool.totalStaked == 0) {
            pool.lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        uint256 rewards = (timeElapsed * pool.rewardRate) / 1 days;
        pool.accRewardPerShare += (rewards * REWARD_PRECISION) / pool.totalStaked;
        pool.lastUpdateTime = block.timestamp;
    }

    function updateUserRewards(address _user, uint256 _poolId) internal {
        StakingInfo storage user = userStaking[_user][_poolId];
        PoolInfo storage pool = pools[_poolId];

        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / REWARD_PRECISION - user.rewardDebt;
            user.rewardDebt += pending;
        }
    }

    function removeUserPool(address _user, uint256 _poolId) internal {
        uint256[] storage pools = userPools[_user];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i] == _poolId) {
                pools[i] = pools[pools.length - 1];
                pools.pop();
                break;
            }
        }
    }

    function getPendingRewards(address _user, uint256 _poolId) external view validPool(_poolId) returns (uint256) {
        PoolInfo memory pool = pools[_poolId];
        StakingInfo memory user = userStaking[_user][_poolId];

        if (user.amount == 0) return 0;

        uint256 accRewardPerShare = pool.accRewardPerShare;
        if (block.timestamp > pool.lastUpdateTime && pool.totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
            uint256 rewards = (timeElapsed * pool.rewardRate) / 1 days;
            accRewardPerShare += (rewards * REWARD_PRECISION) / pool.totalStaked;
        }

        return (user.amount * accRewardPerShare) / REWARD_PRECISION - user.rewardDebt;
    }

    function getUserStakingInfo(address _user, uint256 _poolId) external view validPool(_poolId) returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 pendingRewards
    ) {
        StakingInfo memory user = userStaking[_user][_poolId];
        return (
            user.amount,
            user.startTime,
            user.lastClaimTime,
            this.getPendingRewards(_user, _poolId)
        );
    }

    function getUserPools(address _user) external view returns (uint256[] memory) {
        return userPools[_user];
    }

    function getPoolInfo(uint256 _poolId) external view validPool(_poolId) returns (
        address stakingToken,
        uint256 rewardRate,
        uint256 totalStaked,
        uint256 accRewardPerShare
    ) {
        PoolInfo memory pool = pools[_poolId];
        return (
            address(pool.stakingToken),
            pool.rewardRate,
            pool.totalStaked,
            pool.accRewardPerShare
        );
    }

    // Emergency functions
    function emergencyWithdraw(uint256 _poolId) external nonReentrant validPool(_poolId) {
        uint256 amount = userStaking[msg.sender][_poolId].amount;
        require(amount > 0, "No staked amount");

        userStaking[msg.sender][_poolId].amount = 0;
        userStaking[msg.sender][_poolId].rewardDebt = 0;
        pools[_poolId].totalStaked -= amount;

        IERC20(pools[_poolId].stakingToken).safeTransfer(msg.sender, amount);
        removeUserPool(msg.sender, _poolId);
    }

    function depositRewards() external payable onlyOwner {
        // This function allows the owner to deposit FLOW for rewards
    }

    function withdrawRewards(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(_amount);
    }
}
