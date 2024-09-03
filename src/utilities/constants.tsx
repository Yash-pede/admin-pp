import { MoneyCollectFilled } from "@ant-design/icons";
import { IconCalendarMonth, IconHours12, IconMoneybag } from "@tabler/icons-react";

export const supabaseBucket_Product_images =
  "https://dznfhiyfjniapdbzdjpt.supabase.co/storage/v1/object/public/Products/";

export type challanProductAddingType = {
  product_id: string;
  quantity: number;
  discount: number;
};

export const reportTypes = [
  {
    title: "Fund transfer",
    link: "/administration/reports/money",
    icon: <IconMoneybag style={{width: "50px", height: "50px"}} />,
  },
  {
    title: "Total Products Sold",
    link: "/administration/reports/targets",
    icon: <IconHours12 style={{width: "50px", height: "50px"}} />,
  },
  {
    title: "Month wise earning",
    link: "/administration/reports/products",
    icon: <IconCalendarMonth style={{width: "50px", height: "50px"}} />,
  },
];
