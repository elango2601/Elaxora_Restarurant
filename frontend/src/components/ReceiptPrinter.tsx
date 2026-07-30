'use client'

import React from 'react'
import { useSettings } from '@/context/SettingsContext'

type OrderItem = {
  name: string
  quantity: number
  price: number
}

type ReceiptProps = {
  orderId: string
  customerName: string
  items: OrderItem[]
  total: number
  date: string
  taxRate?: number
  subtotal?: number
}

export default function ReceiptPrinter({ 
  orderId, 
  customerName, 
  items, 
  total, 
  date,
  taxRate = 8.5,
}: ReceiptProps) {
  const { settings } = useSettings()
  
  // Calculate subtotal if not provided
  const activeTaxRate = settings?.tax_rate ?? taxRate
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = (calculatedSubtotal * activeTaxRate) / 100

  return (
    <div className="receipt-container text-black">
      <div className="receipt">
        {/* Header */}
        <div className="receipt-header">
          <h1>{settings?.restaurant_name?.toUpperCase() || 'ELAXORA'}</h1>
          <p>{settings?.address?.split(',')[0] || '123 Luxury Avenue'}</p>
          <p>{settings?.address?.split(',').slice(1).join(',').trim() || 'New York, NY 10001'}</p>
          <p>{settings?.phone || '+91 6374578233'}</p>
          <div className="receipt-divider"></div>
        </div>

        {/* Order Info */}
        <div className="receipt-info">
          <p><strong>Order:</strong> {orderId}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Customer:</strong> {customerName || 'Guest'}</p>
          <div className="receipt-divider"></div>
        </div>

        {/* Items Table */}
        <table className="receipt-items">
          <thead>
            <tr>
              <th className="left">Qty</th>
              <th className="left">Item</th>
              <th className="right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="left">{item.quantity}</td>
                <td className="left">{item.name}</td>
                <td className="right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="receipt-divider"></div>

        {/* Totals */}
        <div className="receipt-totals">
          <div className="flex-row">
            <span>Subtotal</span>
            <span>${calculatedSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex-row">
            <span>Tax ({activeTaxRate}%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex-row grand-total">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* Footer */}
        <div className="receipt-footer">
          <p>Thank you for dining with us!</p>
          <p>Please come again</p>
        </div>
      </div>

      <style jsx>{`
        /* 
          These styles ensure the component looks like a real receipt on screen
          and prints correctly when window.print() is called.
        */
        .receipt-container {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media print {
          /* Hide everything else on the page during print */
          :global(body *) {
            visibility: hidden;
          }

          :global(body) {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          .receipt-container, .receipt-container * {
            visibility: visible;
          }

          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            padding: 0;
          }

          /* 80mm thermal paper width is approx 3.14 inches or 300px */
          .receipt {
            width: 300px;
            font-family: 'Courier New', Courier, monospace; /* Monospace is standard for receipts */
            font-size: 12px;
            line-height: 1.2;
            color: #000;
            padding: 10px;
          }

          .receipt-header, .receipt-footer {
            text-align: center;
            margin-bottom: 10px;
          }

          .receipt-header h1 {
            font-size: 20px;
            margin: 0 0 5px 0;
            font-weight: bold;
          }

          .receipt-header p, .receipt-footer p {
            margin: 2px 0;
          }

          .receipt-info {
            margin-bottom: 10px;
          }

          .receipt-info p {
            margin: 2px 0;
          }

          .receipt-divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          .receipt-items {
            width: 100%;
            border-collapse: collapse;
          }

          .receipt-items th {
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }

          .receipt-items td {
            padding: 4px 0;
            vertical-align: top;
          }

          .left { text-align: left; }
          .right { text-align: right; }

          .receipt-totals {
            margin-top: 10px;
          }

          .flex-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  )
}
