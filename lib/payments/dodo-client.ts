import axios from "axios"

// Always use the test API URL as requested
const DODO_API_KEY = process.env.DODO_API_KEY
const DODO_API_URL = "https://test.dodopayments.com/v1"

const dodoClient = {
  products: {
    list: async () => {
      try {
        const response = await axios.get(`${DODO_API_URL}/products`, {
          headers: {
            Authorization: `Bearer ${DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
        })
        return response.data
      } catch (error) {
        console.error("Error listing products:", error)
        throw error
      }
    },
  },
  subscriptions: {
    create: async (data: any) => {
      try {
        console.log("Creating subscription with Dodo test API:", DODO_API_URL)
        console.log("Subscription data:", JSON.stringify(data))

        const response = await axios.post(`${DODO_API_URL}/subscriptions`, data, {
          headers: {
            Authorization: `Bearer ${DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
        })
        return response.data
      } catch (error: any) {
        console.error("Error creating subscription:", error.message)
        console.error("Response status:", error.response?.status)
        console.error("Response data:", JSON.stringify(error.response?.data || {}))
        throw error
      }
    },
  },
  customers: {
    portal: async (data: any) => {
      try {
        const response = await axios.post(`${DODO_API_URL}/customers/portal`, data, {
          headers: {
            Authorization: `Bearer ${DODO_API_KEY}`,
            "Content-Type": "application/json",
          },
        })
        return response.data
      } catch (error) {
        console.error("Error getting customer portal link:", error)
        throw error
      }
    },
  },
}

export default dodoClient
