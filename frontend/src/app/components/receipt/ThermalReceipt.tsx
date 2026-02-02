import { forwardRef } from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ThermalReceiptProps {
  receiptNo: string;
  dateTime: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  soldBy: string;
  paymentMethod: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  total: number;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  (
    {
      receiptNo,
      dateTime,
      storeName,
      storeAddress,
      storePhone,
      soldBy,
      paymentMethod,
      items,
      subtotal,
      discount = 0,
      total,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className="thermal-receipt"
        style={{
          width: "80mm",
          fontFamily: "monospace",
          fontSize: "12px",
          lineHeight: "1.4",
          color: "#000",
          backgroundColor: "#fff",
          padding: "10mm",
        }}
      >
        {/* Store Header */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            {storeName}
          </div>
          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
            {storeAddress}
          </div>
          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
            Tel: {storePhone}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dashed #000",
            margin: "8px 0",
          }}
        />

        {/* Receipt Info */}
        <div style={{ fontSize: "11px", marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Receipt No:</span>
            <span style={{ fontWeight: "bold" }}>{receiptNo}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Date:</span>
            <span>{dateTime}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Cashier:</span>
            <span>{soldBy}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Payment:</span>
            <span style={{ fontWeight: "bold" }}>{paymentMethod}</span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dashed #000",
            margin: "8px 0",
          }}
        />

        {/* Items Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 50px 60px",
            fontSize: "11px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          <div>ITEM</div>
          <div style={{ textAlign: "center" }}>QTY</div>
          <div style={{ textAlign: "right" }}>AMOUNT</div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: "8px" }}>
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  marginBottom: "2px",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 50px 60px",
                  fontSize: "11px",
                }}
              >
                <div>@ ₦{item.unitPrice.toFixed(2)}</div>
                <div style={{ textAlign: "center" }}>{item.quantity}</div>
                <div style={{ textAlign: "right", fontWeight: "600" }}>
                  ₦{item.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dashed #000",
            margin: "8px 0",
          }}
        />

        {/* Totals */}
        <div style={{ fontSize: "12px", marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span>Subtotal:</span>
            <span>₦{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span>Discount:</span>
              <span>-₦{discount.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: "6px",
              marginTop: "6px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            <span>TOTAL:</span>
            <span>₦{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderBottom: "1px dashed #000",
            margin: "8px 0",
          }}
        />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            marginTop: "12px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            Thank you for your patronage!
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            Please retain this receipt for your records
          </div>
          <div
            style={{
              marginTop: "12px",
              fontSize: "10px",
              color: "#666",
            }}
          >
            Powered by EliMed Pharmacy System
          </div>
        </div>
      </div>
    );
  },
);

ThermalReceipt.displayName = "ThermalReceipt";
