import React from "react";
import Confetti from "../Confetti";

const ServiceStopNotification = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#BCECD3] flex items-center justify-center overflow-hidden">
      <img
        src="/img/close_image_a1.png"
        alt="サービス停止"
        className="max-h-full max-w-full object-contain"
      />
      <Confetti />
    </div>
  );
};

export default ServiceStopNotification;
