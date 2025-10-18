import React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function FailPage() {
  const [searchParams] = useSearchParams();
  // const { response, cleanup } = async () => {
  //   await chargeApi.deletePrePaymentForTossByOrderId({
  //     orderId: searchParams.get('orderId'),
  //   });
  // };
  // const deletePrePaymentInfo = response;

  // useEffect(() => {  
  //   deletePrePaymentInfo();
  // }, [searchParams]);

  return (
    <div className="result wrapper">
      <div className="box_section">
        <h2>Failure</h2>
        <p>{`Error code: ${searchParams.get('code')}`}</p>
        <p>{`Reason: ${searchParams.get('message')}`}</p>
      </div>
    </div>
  );
}
