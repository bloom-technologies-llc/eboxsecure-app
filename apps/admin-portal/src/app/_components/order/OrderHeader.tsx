interface OrderHeaderProps {
  orderId: number;
}

export default function OrderHeader({ orderId }: OrderHeaderProps) {
  return (
    <div className="my-6 flex items-center gap-x-2">
      <p>#{orderId}</p>
    </div>
  );
}
