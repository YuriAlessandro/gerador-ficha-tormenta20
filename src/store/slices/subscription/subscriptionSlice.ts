import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as subscriptionService from '../../../services/subscription.service';
import {
  Subscription,
  PricingPlan,
  Invoice,
  SubscriptionTier,
  SubscriptionLimits,
  getSubscriptionLimits,
} from '../../../types/subscription.types';

export interface SubscriptionState {
  subscription: Subscription | null;
  pricingPlans: PricingPlan[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  limits: SubscriptionLimits | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  pricingPlans: [],
  invoices: [],
  loading: false,
  error: null,
  limits: null,
};

// Async thunks
export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async () => {
    const subscription = await subscriptionService.getCurrentSubscription();
    return subscription;
  }
);

export const fetchPricingPlans = createAsyncThunk(
  'subscription/fetchPricingPlans',
  async () => {
    const plans = await subscriptionService.getPricingPlans();
    return plans;
  }
);

export const fetchInvoices = createAsyncThunk(
  'subscription/fetchInvoices',
  async (limit?: number) => {
    const invoices = await subscriptionService.getInvoices(limit || 10);
    return invoices;
  }
);

export const createCheckout = createAsyncThunk(
  'subscription/createCheckout',
  async (tier: SubscriptionTier) => {
    await subscriptionService.redirectToCheckout(tier);
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async () => {
    const subscription = await subscriptionService.cancelSubscription();
    return subscription;
  }
);

export const reactivateSubscription = createAsyncThunk(
  'subscription/reactivateSubscription',
  async () => {
    const subscription = await subscriptionService.reactivateSubscription();
    return subscription;
  }
);

export const openCustomerPortal = createAsyncThunk(
  'subscription/openCustomerPortal',
  async () => {
    await subscriptionService.openCustomerPortal();
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
      if (action.payload) {
        state.limits = getSubscriptionLimits(action.payload.tier);
      } else {
        state.limits = getSubscriptionLimits(SubscriptionTier.FREE);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch subscription
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
        if (action.payload) {
          state.limits = getSubscriptionLimits(action.payload.tier);
        } else {
          state.limits = getSubscriptionLimits(SubscriptionTier.FREE);
        }
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription';
      });

    // Fetch pricing plans
    builder
      .addCase(fetchPricingPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricingPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.pricingPlans = action.payload;
      })
      .addCase(fetchPricingPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pricing plans';
      });

    // Fetch invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      });

    // Create checkout
    builder
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckout.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create checkout';
      });

    // Cancel subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel subscription';
      });

    // Reactivate subscription
    builder
      .addCase(reactivateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to reactivate subscription';
      });

    // Open customer portal
    builder
      .addCase(openCustomerPortal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(openCustomerPortal.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(openCustomerPortal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to open customer portal';
      });
  },
});

export const { clearSubscriptionError, setSubscription } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
