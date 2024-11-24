// import { z } from 'zod'

// export const ordersResponse = z.array(
//   z.object({
//     id: z.string(),
//     name: z.string(),
//     clientName: z.string(),
//     pallets: z.array(
//       z.object({
//         id: z.string(),
//         entries: z.array(
//           z.object({
//             id: z.string(),
//             // productName: z.string(),
//             productId: z.string(),
//             cartons: z.number(),
//             weight: z.number(),
//           })
//         ),
//       })
//     ),
//   })
// )

// export type OrdersResponse = z.infer<typeof ordersResponse>

// export const productsResponse = z.array(
//   z.object({
//     id: z.string(),
//     name: z.string(),
//     description: z.string(),
//   })
// )

// export type ProductsResponse = z.infer<typeof productsResponse>

// export const clientsResponse = z.array(
//   z.object({
//     id: z.string(),
//     name: z.string(),
//     email: z.string(),
//     phoneNumber: z.string(),
//   })
// )

// export type ClientsResponse = z.infer<typeof clientsResponse>

// export const statsResponse = z.array(
//   z.object({
//     productName: z.string(),
//     pallets: z.number(),
//     cartons: z.number(),
//     weight: z.number(),
//   })
// )

// export type StatsResponse = z.infer<typeof statsResponse>

// export const queryResponse = z.array(
//   z.object({
//     date: z.string(),
//     products: z.array(
//       z.object({
//         name: z.string(),
//         cartons: z.number(),
//         weight: z.number(),
//       })
//     ),
//     pallets: z.number(),
//   })
// )

// export type queryResponse = z.infer<typeof statsResponse>

// export const pricesResponse = z.array(
//   z.object({
//     productName: z.string(),
//     typeA: z.coerce.number(),
//     best: z.coerce.number().optional(),
//   })
// )

// export type PricesResponse = z.infer<typeof pricesResponse>

// export const settingsResponse = z.object({})

// export type SettingsResponse = z.infer<typeof settingsResponse>

// export const shippingSlipsResponse = z.array(
//   z.object({
//     clientName: z.string(),
//     shippingSlips: z.array(
//       z.object({
//         id: z.string(),
//         date: z.date(),
//         number: z.number(),
//         pallets: z.coerce.number(),
//         items: z
//           .array(
//             z.object({
//               productId: z.string(),
//               quantity: z.number(),
//               weight: z.number(),
//               unitPrice: z.number(),
//               total: z.number(),
//             })
//           )
//           .optional(),
//         subtotal: z.number(),
//         vat: z.number(),
//         total: z.number(),
//       })
//     ),
//   })
// )

// export type ShippingSlipsResponse = z.infer<typeof shippingSlipsResponse>
