import React from "react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ConnectButton, useWalletKit } from "@mysten/wallet-kit";

import { Layout } from "../components/layouts/layout";
import { OBJECT_RECORD, LAMPORT } from "../config";
import {
  useGetBalance,
  useGetDepositValue,
  useGetPoolInfo,
  useStakingMethods,
} from "../hooks";

interface POOLINFO {
  AllocationPoints?: string;
  LastRewardTimeStamp?: string;
  AccruedIPXPerShare?: string;
  BalanceValue?: string;
}

export const HomePage = () => {
  const DEPOSITDESCRIPTION = "SUI amount to deposit";
  const WITHDRAWDESCRIPTION = "SUI amount to withdraw";
  const { currentAccount } = useWalletKit();
  const { deposit, withdraw } = useStakingMethods();
  const [unStake, setUnStake] = useState<any>(false);
  const [actionCount, setActionCount] = useState<number>(0);
  const [description, setDescription] = useState<string>(DEPOSITDESCRIPTION);

  const initPool = {
    AllocationPoints: "",
    LastRewardTimeStamp: "",
    AccruedIPXPerShare: "",
    BalanceValue: "",
  };
  const [currentPoolInfo, setPoolInfo] = useState<POOLINFO>(initPool);

  // ---------- Get Pending  details -----------
  const currentBalance = useGetBalance(
    currentAccount?.address || OBJECT_RECORD.AddressZero,
    actionCount
  );
  // -------------------------------------------

  // ---------- Get POOL INFO -----------
  const poolInfo = useGetPoolInfo(actionCount);
  useEffect(() => {
    if (poolInfo) {
      setPoolInfo(poolInfo);
    }
  }, [poolInfo]);
  // ------------------------------------

  // ---------- Get Deposited Value -----------

  const depositValue = useGetDepositValue(actionCount);
  console.log("Deposit value -------------", depositValue);
  const totalDepositedAmount = (depositValue / LAMPORT).toFixed(3);

  // ------------------------------------

  const [address, setAddress] = useState<any>("");
  useEffect(() => {
    if (currentAccount?.address) {
      let tempAddr = currentAccount?.address;
      setAddress(tempAddr.slice(0, 4) + "..." + tempAddr.slice(-4));
    } else setAddress("");
  }, [currentAccount]);

  const [amount, setAmount] = useState<any>(0);
  const maxFunction = () => {
    if (unStake) {
      setAmount(totalDepositedAmount);
    } else {
      setAmount(
        currentAccount?.address && parseFloat(currentBalance) > 0.3
          ? (parseFloat(currentBalance) - 0.3).toFixed(3)
          : "0.000"
      );
    }
  };

  const handleStake = async (amount) => {
    let tx = await deposit(amount);
    let status: string = tx!["effects"]!["status"]!["status"] || "failure";
    let error: string =
      tx!["effects"]!["status"]!["error"] ||
      "We are aorry. Please try later again.";

    if (status === "failure") {
      toast(error, {
        type: "error",
      });
    } else {
      toast("Deposit success", {
        type: "success",
      });
      const newCount = actionCount + 1;
      setActionCount(newCount);
    }
  };

  const handleUnstake = async (amount) => {
    try {
      let tx = await withdraw(amount);
      let status: string = tx!["effects"]!["status"]!["status"] || "failure";
      let error: string =
        tx!["effects"]!["status"]!["error"] ||
        "We are aorry. Please try later again.";

      if (status === "failure") {
        toast(error, {
          type: "error",
        });
      } else {
        toast("Withdraw success", {
          type: "success",
        });
        const newCount = actionCount + 1;
        setActionCount(newCount);
      }
    } catch (error) {
      toast("Withdraw is not allowed for owner", {
        type: "error",
      });
    }
  };

  return (
    <Layout balance={currentBalance}>
      <div className="flex-1 flex flex-col gap-50 items-center">
        <div className="flex flex-row gap-20 flex-wrap justify-center">
          <div className="w-250 flex flex-col gap-5 mm:gap-10 lg:gap-15 bg-foreground px-10 mm:px-15 lg:px-20 py-10 mm:py-15 lg:py-20 rounded-md">
            <span className="text-10 mm:text-12 opacity-50">
              Total SUI Staked
            </span>
            <span className="text-15 mm:text-20 font-bold">
              {currentPoolInfo["BalanceValue"]
                ? currentPoolInfo["BalanceValue"] + " SUI"
                : "0.000 SUI"}
            </span>
            {/* <span className="text-12 mm:text-15 font-semibold">= $ 13.88M</span> */}
          </div>

          <div className="w-250 flex flex-col gap-5 mm:gap-10 lg:gap-15 bg-foreground px-10 mm:px-15 lg:px-20 py-10 mm:py-15 lg:py-20 rounded-md">
            <span className="text-10 mm:text-12 opacity-50">
              Current Deposited Amount
            </span>
            <span className="text-15 mm:text-20 font-bold">
              {`${totalDepositedAmount} SUI`}
            </span>
            {/* <span className="text-12 mm:text-15 font-semibold">= $ 2.88</span> */}
          </div>
        </div>

        <div className="flex flex-col gap-30 items-center">
          <div className="flex flex-col items-center text-center">
            <span className="text-30 md:text-40 lg:text-50 font-bold">
              Manage Your SUI
            </span>
            <span className="text-12 md:text-15 lg:text-18 opacity-50">
              Deposit SUI and receive SUI for only admin
            </span>
          </div>

          <div className="flex flex-row gap-5 p-5 bg-foreground rounded-full">
            <div
              onClick={() => {
                setUnStake(false);
                setDescription(DEPOSITDESCRIPTION);
              }}
              className={`w-100 md:w-120 lg:w-150 py-5 md:py-8 lg:py-10 ${
                !unStake && "bg-primary"
              } rounded-full text-center cursor-pointer switch-item`}
            >
              <span className="text-15 md:text-18 lg:text-20 font-semibold">
                Deposit
              </span>
            </div>

            <div
              onClick={() => {
                setUnStake(true);
                setDescription(WITHDRAWDESCRIPTION);
              }}
              className={`w-100 md:w-120 lg:w-150 py-5 md:py-8 lg:py-10 ${
                unStake && "bg-primary"
              } rounded-full text-center cursor-pointer switch-item`}
            >
              <span className="text-15 md:text-18 lg:text-20 font-semibold">
                Withdraw
              </span>
            </div>
          </div>

          <div className="w-full max-w-500 flex flex-col gap-15 md:gap-18 lg:gap-20 px-15 md:px-18 lg:px-20 py-15 md:py-18 lg:py-20 bg-modalBg rounded-md">
            <div className="flex flex-col px-15 md:px-18 lg:px-20 py-10 md:py-12 lg:py-15 bg-foreground rounded-md">
              <div className="flex flex-row gap-10 justify-between items-center py-10 md:py-15 lg:py-20">
                <div className="flex flex-row gap-5 md:gap-10 items-center">
                  <div className="w-20 md:w-30 h-20 md:h-30 bg-white rounded-full" />
                  <span className="text-15 md:text-18 lg:text-20 font-semibold">
                    SUI
                  </span>
                </div>

                <div className="flex flex-row gap-10 items-center">
                  <span className="text-12 md:text-15 opacity-50">
                    {description}
                  </span>

                  <span
                    className="text-15 md:text-18 lg:text-20 font-bold text-primary cursor-pointer"
                    onClick={maxFunction}
                  >
                    MAX
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-text py-5 md:py-8 lg:py-10">
                <div className="flex flex-row gap-10 text-12 md:text-15 opacity-50">
                  Amount:
                  <input
                    placeholder="0"
                    className="text-right"
                    type="number"
                    value={amount}
                    step={0.001}
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      if (value > 0) {
                        setAmount(value);
                      } else setAmount(0);
                    }}
                  />
                  SUI
                </div>
              </div>
            </div>

            {!unStake && (
              <>
                {/* <div className="flex flex-row justify-between">
                  <span className="text-12 md:text-15 opacity-80">
                    You will receive
                  </span>
                  <span className="text-12 md:text-15 opacity-80">
                    0.000 SUI
                  </span>
                </div> */}

                {!!address && (
                  <div
                    onClick={() => {
                      handleStake(amount * LAMPORT);
                    }}
                    className="bg-primary px-10 py-10 md:py-15 rounded-lg text-center cursor-pointer text-12 md:text-15 font-semibold"
                  >
                    <span>Deposit</span>
                  </div>
                )}
              </>
            )}

            {!!unStake && (
              <>
                {!!address && (
                  <div
                    onClick={() => {
                      handleUnstake(amount * LAMPORT);
                    }}
                    className="bg-primary px-10 py-10 md:py-15 rounded-lg text-center cursor-pointer text-12 md:text-15 font-semibold"
                  >
                    <span>Withdraw</span>
                  </div>
                )}
              </>
            )}

            {!address && (
              <ConnectButton
                connectedText={address}
                connectText={"Connect Wallet"}
                className="connect-btn px-10 py-10 md:py-15 rounded-lg text-center cursor-pointer text-12 md:text-15 font-semibold"
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
