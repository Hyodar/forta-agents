
export const STAKING_REWARDS_ADDRESS = "0x501ace3D42f9c8723B108D4fBE29989060a91411".toLowerCase();

// https://etherscan.io/address/0x501ace3D42f9c8723B108D4fBE29989060a91411#code#F1#L6
export const SET_REWARDS_ABI = "function setRewards(uint256 rewardPerSecond_)";
export const SET_REWARDS_SIGNATURE = "setRewards(uint256)";
export const SET_TIMES_ABI = "function setTimes(uint256 startTime_, uint256 endTime_)";
export const SET_TIMES_SIGNATURE = "setTimes(uint256,uint256)";

export const FUNCTION_PARAMS: Record<string, Array<string>> = {
    "setRewards": ["rewardPerSecond_"],
    "setTimes": ["startTime_", "endTime_"],
};

// https://etherscan.io/address/0x501ace3D42f9c8723B108D4fBE29989060a91411#code#F9#L1
export const REWARDS_SET_ABI = "event RewardsSet(uint256 rewardPerSecond)";
export const REWARDS_SET_SIGNATURE = "RewardsSet(uint256)";
export const FARM_TIMES_SET_ABI = "event FarmTimesSet(uint256 startTime, uint256 endTime)";
export const FARM_TIMES_SET_SIGNATURE = "FarmTimesSet(uint256,uint256)";

export const EVENT_PARAMS: Record<string, Array<string>> = {
    "RewardsSet": ["rewardPerSecond"],
    "FarmTimesSet": ["startTime", "endTime"],
};
