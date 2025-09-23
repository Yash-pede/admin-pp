import {
  IconCalendarMonth,
  IconHours12,
  IconMoneybag,
} from "@tabler/icons-react";

export const supabaseBucket_Product_images = import.meta.env
  .VITE_SUPABASE_BUCKET;

export type challanProductAddingType = {
  product_id: string;
  quantity: number;
  discount: number;
  free_q: number;
  actual_q: number;
  selling_price: number;
};

export const reportTypes = [
  // {
  //   title: "Fund transfer",
  //   link: "/administration/reports/money",
  //   icon: <IconMoneybag style={{ width: "50px", height: "50px" }} />,
  // },
  {
    title: "Total Products Sold",
    link: "/administration/reports/products",
    icon: <IconHours12 style={{ width: "50px", height: "50px" }} />,
  },
  {
    title: "Month wise earning",
    link: "/administration/reports/sold-products",
    icon: <IconCalendarMonth style={{ width: "50px", height: "50px" }} />,
  },
];
