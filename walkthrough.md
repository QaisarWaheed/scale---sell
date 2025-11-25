# Verification Walkthrough

This document outlines the steps to verify the recent changes to the Scale & Sell application.

## 1. Contact Form

1.  Navigate to the **Contact** page (`/contact`).
2.  Fill out the form with test data.
3.  Click **Send Message**.
4.  **Verify**:
    - The button text changes to "Sending...".
    - A success toast message appears: "Thank you! We'll get back to you soon.".
    - The form fields are cleared.
    - (Optional) Check the backend console logs to see the received message object.

## 2. Messaging System

1.  Log in as a user (Investor or Seller).
2.  Navigate to the **Dashboard** and click on the **Messages** tab.
3.  **Verify**:
    - The conversation list loads (or shows "No conversations found").
    - Select a conversation (if any exist).
    - Messages load correctly.
    - Type a message and press **Enter** or click the **Send** icon.
    - The message appears immediately in the chat window.
    - The input field is cleared.

## 3. Skeleton Loading

1.  Navigate to a **Listing Details** page (e.g., `/listing/<id>`).
2.  **Verify**:
    - While data is fetching, you see skeleton placeholders (gray pulsing blocks) instead of a spinning loader.
    - The layout remains stable during loading.
3.  Navigate to the **Messages** tab.
4.  **Verify**:
    - The conversation list shows skeleton loaders while fetching threads.

## 4. Saved Listings

1.  Log in as an **Investor**.
2.  Navigate to the **Dashboard**.
3.  Click on the **Saved Listings** card or tab (if available in navigation).
4.  **Verify**:
    - The dedicated Saved Listings page loads.
    - If you have saved listings, they are displayed in a list.
    - If not, an empty state with a "Browse Listings" button is shown.

# Verification Walkthrough

This document outlines the steps to verify the recent changes to the Scale & Sell application.

## 1. Contact Form

1.  Navigate to the **Contact** page (`/contact`).
2.  Fill out the form with test data.
3.  Click **Send Message**.
4.  **Verify**:
    - The button text changes to "Sending...".
    - A success toast message appears: "Thank you! We'll get back to you soon.".
    - The form fields are cleared.
    - (Optional) Check the backend console logs to see the received message object.

## 2. Messaging System

1.  Log in as a user (Investor or Seller).
2.  Navigate to the **Dashboard** and click on the **Messages** tab.
3.  **Verify**:
    - The conversation list loads (or shows "No conversations found").
    - Select a conversation (if any exist).
    - Messages load correctly.
    - Type a message and press **Enter** or click the **Send** icon.
    - The message appears immediately in the chat window.
    - The input field is cleared.

## 3. Skeleton Loading

1.  Navigate to a **Listing Details** page (e.g., `/listing/<id>`).
2.  **Verify**:
    - While data is fetching, you see skeleton placeholders (gray pulsing blocks) instead of a spinning loader.
    - The layout remains stable during loading.
3.  Navigate to the **Messages** tab.
4.  **Verify**:
    - The conversation list shows skeleton loaders while fetching threads.

## 4. Saved Listings

1.  Log in as an **Investor**.
2.  Navigate to the **Dashboard**.
3.  Click on the **Saved Listings** card or tab (if available in navigation).
4.  **Verify**:
    - The dedicated Saved Listings page loads.
    - If you have saved listings, they are displayed in a list.
    - If not, an empty state with a "Browse Listings" button is shown.

## 5. Backend Improvements

1.  **Error Handling**:
    - The application should handle API errors gracefully, displaying toast notifications with user-friendly messages.
2.  **Escrow Webhook**:
    - The backend is now prepared to verify Escrow.com webhooks (currently in development mode).

## 6. Investment & Offers

1.  Log in as an **Investor**.

# Verification Walkthrough

This document outlines the steps to verify the recent changes to the Scale & Sell application.

## 1. Contact Form

1.  Navigate to the **Contact** page (`/contact`).
2.  Fill out the form with test data.
3.  Click **Send Message**.
4.  **Verify**:
    - The button text changes to "Sending...".
    - A success toast message appears: "Thank you! We'll get back to you soon.".
    - The form fields are cleared.
    - (Optional) Check the backend console logs to see the received message object.

## 2. Messaging System

1.  Log in as a user (Investor or Seller).
2.  Navigate to the **Dashboard** and click on the **Messages** tab.
3.  **Verify**:
    - The conversation list loads (or shows "No conversations found").
    - Select a conversation (if any exist).
    - Messages load correctly.
    - Type a message and press **Enter** or click the **Send** icon.
    - The message appears immediately in the chat window.
    - The input field is cleared.

## 3. Skeleton Loading

1.  Navigate to a **Listing Details** page (e.g., `/listing/<id>`).
2.  **Verify**:
    - While data is fetching, you see skeleton placeholders (gray pulsing blocks) instead of a spinning loader.
    - The layout remains stable during loading.
3.  Navigate to the **Messages** tab.
4.  **Verify**:
    - The conversation list shows skeleton loaders while fetching threads.

## 4. Saved Listings

1.  Log in as an **Investor**.
2.  Navigate to the **Dashboard**.
3.  Click on the **Saved Listings** card or tab (if available in navigation).
4.  **Verify**:
    - The dedicated Saved Listings page loads.
    - If you have saved listings, they are displayed in a list.
    - If not, an empty state with a "Browse Listings" button is shown.

# Verification Walkthrough

This document outlines the steps to verify the recent changes to the Scale & Sell application.

## 1. Contact Form

1.  Navigate to the **Contact** page (`/contact`).
2.  Fill out the form with test data.
3.  Click **Send Message**.
4.  **Verify**:
    - The button text changes to "Sending...".
    - A success toast message appears: "Thank you! We'll get back to you soon.".
    - The form fields are cleared.
    - (Optional) Check the backend console logs to see the received message object.

## 2. Messaging System

1.  Log in as a user (Investor or Seller).
2.  Navigate to the **Dashboard** and click on the **Messages** tab.
3.  **Verify**:
    - The conversation list loads (or shows "No conversations found").
    - Select a conversation (if any exist).
    - Messages load correctly.
    - Type a message and press **Enter** or click the **Send** icon.
    - The message appears immediately in the chat window.
    - The input field is cleared.

## 3. Skeleton Loading

1.  Navigate to a **Listing Details** page (e.g., `/listing/<id>`).
2.  **Verify**:
    - While data is fetching, you see skeleton placeholders (gray pulsing blocks) instead of a spinning loader.
    - The layout remains stable during loading.
3.  Navigate to the **Messages** tab.
4.  **Verify**:
    - The conversation list shows skeleton loaders while fetching threads.

## 4. Saved Listings

1.  Log in as an **Investor**.
2.  Navigate to the **Dashboard**.
3.  Click on the **Saved Listings** card or tab (if available in navigation).
4.  **Verify**:
    - The dedicated Saved Listings page loads.
    - If you have saved listings, they are displayed in a list.
    - If not, an empty state with a "Browse Listings" button is shown.

## 5. Backend Improvements

1.  **Error Handling**:
    - The application should handle API errors gracefully, displaying toast notifications with user-friendly messages.
2.  **Escrow Webhook**:
    - The backend is now prepared to verify Escrow.com webhooks (currently in development mode).

## 6. Investment & Offers

1.  Log in as an **Investor**.
2.  Navigate to a **Listing Details** page.
3.  **Verify**:
    - If the listing is for sale, you see a **Make Purchase Offer** button.
    - If the listing is for investment, you see an **Invest Now** button.
    - Clicking the button opens the respective dialog.
    - You can submit an offer/investment.
    - After submission, you are redirected or see a success message.

## 7. Investor Dashboard Enhancements

1.  Log in as an **Investor**.
2.  **Verify Sidebar**:
    - "Contracts" and "Saved Listings" items are present in the sidebar.
    - Clicking "Contracts" navigates to `/dashboard?tab=contracts`.
    - Clicking "Saved Listings" navigates to `/dashboard?tab=saved`.
3.  **Contracts Page**:
    - Navigate to the **Contracts** tab.
    - Verify that the list of contracts loads (or shows "No contracts found").
    - (Optional) If a draft contract exists, verify the "Sign Contract" button works.
4.  **Buy Button**:
    - Navigate to a **Listing Details** page.
    - Verify the button text is now **"Buy / Make Offer"**.
    - Clicking it opens the offer dialog.
