import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from './Title.jsx';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const subtotal = getCartAmount();

  // Set delivery fee to 0 if subtotal > 5000
  const appliedDeliveryFee = subtotal > 5000 ? 0 : delivery_fee;

  const total = subtotal === 0 ? 0 : subtotal + appliedDeliveryFee;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-2xl">
        <Title
          headline="Cart Totals"
          subline="Final Amount Before Checkout"
        />
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-4 text-sm sm:text-base text-gray-800">
        <div className="flex justify-between items-center border-gray-300 border-1 p-4">
          <span>Subtotal</span>
          <span>{currency} {subtotal}.00</span>
        </div>

        <div className="flex justify-between items-center border-gray-300 border-1 p-4">
          <span>Shipping Fee</span>
          <span>
            {appliedDeliveryFee === 0 ? 'Free' : `${currency} ${appliedDeliveryFee}.00`}
          </span>
        </div>

        <div className="flex justify-between items-center font-semibold text-base border-gray-300 border-1 p-4">
          <span>Total</span>
          <span>{currency} {total}.00</span>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
