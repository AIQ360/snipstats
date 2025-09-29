import axios from "axios"

const DODO_API_KEY = process.env.DODO_API_KEY
// ALWAYS use test API as requested by user
const DODO_API_URL = "https://test.dodopayments.com"

// Create a plan in Dodo Payments
export async function createDodoPlan(planData: {
  name: string
  description: string
  amount: number
  currency: string
  interval?: string
  interval_count?: number
  billing_type: "recurring" | "one_time"
}) {
  try {
    // Log the request for debugging
    console.log(`Creating plan with data:`, JSON.stringify(planData, null, 2))
    console.log(`API URL: ${DODO_API_URL}/subscriptions/plans`)

    const response = await axios.post(`${DODO_API_URL}/subscriptions/plans`, planData, {
      headers: {
        Authorization: `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Plan creation response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating Dodo plan:", error)
    // Log more detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Create a subscription for a customer
export async function createSubscription(data: {
  plan_id: string // Use plan_id instead of product_id
  customer: {
    email: string
    name?: string
    metadata?: Record<string, any>
  }
  return_url: string
  cancel_url: string
  metadata?: Record<string, any>
}) {
  try {
    // Log the request for debugging
    console.log(`Creating subscription with data:`, JSON.stringify(data, null, 2))
    console.log(`API URL: ${DODO_API_URL}/subscriptions`)
    console.log(`API Key (first 10 chars): ${DODO_API_KEY?.substring(0, 10)}...`)

    // Add payment_link: true to the request
    const requestData = {
      product_id: data.plan_id,
      quantity: 1, // Required field
      customer: {
        name: data.customer.name || "Customer",
        email: data.customer.email,
        create_new_customer: false, // Use existing customer if available
      },
      billing: {
        country: "US", // Default billing address
        state: "CA",
        city: "San Francisco",
        street: "123 Main St",
        zipcode: "94102",
      },
      return_url: data.return_url,
      cancel_url: data.cancel_url,
      payment_link: true,
      metadata: data.metadata || {},
    }

    const response = await axios.post(`${DODO_API_URL}/subscriptions`, requestData, {
      headers: {
        Authorization: `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Subscription creation response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating subscription:", error)
    // Log more detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    console.log(`Getting subscription details for: ${subscriptionId}`)
    console.log(`API URL: ${DODO_API_URL}/subscriptions/${subscriptionId}`)

    const response = await axios.get(`${DODO_API_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Subscription details response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error getting subscription details:", error)
    // Log more detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  try {
    console.log(`Canceling subscription: ${subscriptionId}, cancelAtPeriodEnd: ${cancelAtPeriodEnd}`)
    console.log(`API URL: ${DODO_API_URL}/subscriptions/${subscriptionId}`)

    const response = await axios.patch(
      `${DODO_API_URL}/subscriptions/${subscriptionId}`,
      {
        cancel_at_next_billing_date: cancelAtPeriodEnd,
      },
      {
        headers: {
          Authorization: `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Subscription cancellation response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error canceling subscription:", error)
    // Log more detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Update subscription status
export async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  try {
    console.log(`Updating subscription status: ${subscriptionId} to ${status}`)
    console.log(`API URL: ${DODO_API_URL}/subscriptions/${subscriptionId}`)

    const response = await axios.patch(
      `${DODO_API_URL}/subscriptions/${subscriptionId}`,
      {
        status: status,
      },
      {
        headers: {
          Authorization: `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Subscription update response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error updating subscription status:", error)
    // Log more detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Get customer portal link
export async function getCustomerPortalLink(customerId: string) {
  try {
    const response = await axios.post(
      `${DODO_API_URL}/customers/portal`,
      {
        customer_id: customerId,
      },
      {
        headers: {
          Authorization: `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error) {
    console.error("Error getting portal link:", error)
    throw error
  }
}
