import { AuditLogProvider, BaseKey, MetaDataQuery } from "@refinedev/core";
import { supabaseServiceRoleClient } from "../supabaseClient";
import { dataProvider } from "@refinedev/supabase";

export const auditLogProvider: AuditLogProvider = {
  create: async (params) => {
    const { resource, meta, action, author, data, previousData } = params;

    console.log(resource); // "produts", "posts", etc.
    console.log(meta); // { id: "1" }, { id: "2" }, etc.
    console.log(action); // "create", "update", "delete"

    // author object is `useGetIdentity` hook's return value.
    console.log(author); // { id: "1", name: "John Doe" }
    console.log(data); // { name: "Product 1", price: 100 }
    console.log(previousData); // { name: "Product 1", price: 50 }

    const { data: createdData, error } = await supabaseServiceRoleClient
      .from("logs")
      .insert([{
        resource,
        meta: JSON.stringify(meta),
        action,
        author: JSON.stringify(author),
        data: JSON.stringify(data),
        previousData: JSON.stringify(previousData),
      }])
      .select();

    return createdData[0];
  },

  get: async ({ resource, meta }) => {
    console.log("Gtting");
    const { data } = await dataProvider(supabaseServiceRoleClient).getList({
      resource: "logs",
      filters: [
        {
          field: "resource",
          operator: "eq",
          value: resource,
        },
        {
          field: "meta.id",
          operator: "eq",
          value: meta?.id,
        },
      ],
    });

    return data;
  },
  update: function (params: {
    [key: string]: any;
    id: BaseKey;
    name: string;
  }): Promise<any> {
    throw new Error("Function not implemented.");
  },
};
