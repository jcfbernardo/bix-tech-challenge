### **Test Suite: BIX Mini E-commerce**


**ID:** CT-001

**Title:** Add a valid quantity of a product to the cart
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** Equivalence Partitioning (Valid)
**Description:** Validates that the system allows adding a product quantity to the cart that is within the available stock limit (greater than zero and less than or equal to the stock).
**Precondition:** The user is on the product page. The "Mouse" product has 25 units in stock. The cart is empty.
**Steps:**
1.  Locate the "Mouse" product.
2.  In the quantity field, enter the value "10".
3.  Click the "Add" button.
**Expected Result:** The "Mouse" product should be added to the cart with a quantity of 10. The cart subtotal should be updated to R$ 995.00, and the total item count to 10.

**ID:** CT-002

**Title:** Attempt to add the maximum stock quantity of a product
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** Boundary Value Analysis
**Description:** Tests the upper boundary of the valid partition, ensuring the system accepts adding the exact quantity of products available in stock.
**Precondition:** The user is on the product page. The "Keyboard" product has 15 units in stock. The cart is empty.
**Steps:**
1.  Locate the "Keyboard" product.
2.  In the quantity field, enter the value "15".
3.  Click the "Add" button.
**Expected Result:** The "Keyboard" product should be added to the cart with 15 units. The subtotal should be R$ 2,998.50. The "Keyboard" stock on the product interface should either be zeroed out or the "Add" button should be disabled.

**ID:** CT-003

**Title:** Attempt to add a product quantity above the available stock
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Boundary Value Analysis
**Description:** Tests the boundary immediately outside the valid partition to ensure the system blocks adding a product quantity greater than the available stock.
**Precondition:** The user is on the product page. The "Headset" product has 8 units in stock.
**Steps:**
1.  Locate the "Headset" product.
2.  In the quantity field, enter the value "9".
3.  Click the "Add" button.
**Expected Result:** The system should display a clear error message, such as "Requested quantity unavailable in stock." The product should not be added to the cart.

**ID:** CT-004

**Title:** Attempt to add a zero quantity of a product
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Equivalence Partitioning (Invalid)
**Description:** Validates that the system does not allow adding a null (zero) quantity of a product to the cart.
**Precondition:** The user is on the product page.
**Steps:**
1.  Locate any product.
2.  In the quantity field, enter the value "0".
3.  Click the "Add" button.
**Expected Result:** The system should display an error message or simply take no action. The cart should remain unchanged.

**ID:** CT-005

**Title:** Apply a valid percentage discount coupon
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** Equivalence Partitioning (Valid)
**Description:** Ensures that a valid and active percentage discount coupon is applied correctly, recalculating the purchase total.
**Precondition:** The user has added a "Keyboard" (R$ 199.90) to the cart. A valid coupon "DESC10" offering a 10% discount exists.
**Steps:**
1.  Navigate to the "Finalize Purchase" section.
2.  In the "Coupon code" field, enter "DESC10".
3.  Click "Apply Coupon".
**Expected Result:** The system should display the discount amount (R$ 19.99). The total purchase amount should be recalculated to R$ 179.91.

**ID:** CT-006

**Title:** [Invalid EP] Attempt to apply a non-existent discount coupon
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Equivalence Partitioning (Invalid)
**Description:** Validates that the system rejects coupon codes that do not exist in the database.
**Precondition:** The user has items in the cart.
**Steps:**
1.  Navigate to the "Finalize Purchase" section.
2.  In the "Coupon code" field, enter "FAKE_COUPON".
3.  Click "Apply Coupon".
**Expected Result:** The system should display a clear error message, such as "Invalid or expired coupon." The purchase total should not be altered.

**ID:** CT-007

**Title:** Validate purchase flow and cart clearing
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** State Transition Testing
**Description:** This test validates the cart's state transition from "With Items" to "Empty" after a successful purchase is completed.
**Precondition:** The user is authenticated. The cart contains at least one product.
**Steps:**
1.  Add a "Mouse" to the cart.
2.  Go to the "Finalize Purchase" section.
3.  Click the "Finalize Purchase" button.
**Expected Result:** The purchase should be processed successfully. The system should redirect the user to a confirmation page or display a success message. The shopping cart (subtotal, items, and total) must be reset to zero.

**ID:** CT-008

**Title:** Validate product state after stock is depleted
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** State Transition Testing
**Description:** Validates a product's state transition from "In Stock" to "Out of Stock" after the last available unit is purchased.
**Precondition:** The user is authenticated. The "Headset" product has only 1 unit in stock.
**Steps:**
1.  Add 1 unit of the "Headset" to the cart.
2.  Proceed to checkout and finalize the purchase.
3.  After confirmation, navigate back to the products page.
**Expected Result:** In the product listing, the "Headset" stock should be displayed as 0. The quantity field and the "Add" button for this product must be disabled.

**ID:** CT-009

**Title:** Validate user session state transition (Login/Logout)
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** State Transition Testing
**Description:** Verifies the state transitions from "Logged Out" to "Logged In" and from "Logged In" to "Logged Out," ensuring the user interface adapts correctly.
**Precondition:** The user has valid credentials.
**Steps:**
1.  On the initial screen ("Logged Out" state), enter a valid email and password and click "Enter".
2.  Verify the user interface.
3.  Click the "Logout" button/link.
4.  Verify the user interface again.
**Expected Result:** After step 1, the login area should disappear and be replaced by a greeting or a "Logout" button ("Logged In" state). After step 3, the interface should return to its original state, displaying the "Email" and "Password" fields for login ("Logged Out" state).


These tests optimize the verification of interactions between different parameters (e.g., user type, coupon type, stock) to cover the majority of scenarios with a minimal number of tests.

**ID:** CT-010

**Title:** Authenticated user completes purchase of in-stock product with a percentage coupon
**Test Type:** Functional
**Scenario:** Positive
**Technique Applied:** Pairwise Testing
**Description:** This test validates the interaction between the variables: User Status (Authenticated), Stock (Available), Coupon Type (Percentage), and Action (Finalize Purchase).
**Precondition:** The user is authenticated. The "Keyboard" product is in stock. A valid percentage discount coupon exists.
**Steps:**
1.  Add a "Keyboard" to the cart.
2.  Apply the percentage discount coupon.
3.  Click "Finalize Purchase".
**Expected Result:** The purchase should be completed successfully, with the percentage discount correctly applied, and the product's stock should be decremented.

**ID:** CT-011

**Title:** Unauthenticated user attempts to finalize purchase of in-stock product with a fixed coupon
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Pairwise Testing
**Description:** Validates the interaction between: User Status (Unauthenticated), Stock (Available), Coupon Type (Fixed), and Action (Finalize Purchase). The focus is on validating the checkout route protection.
**Precondition:** The user is not authenticated. The "Mouse" product is in stock. A valid fixed-value coupon exists.
**Steps:**
1.  Add a "Mouse" to the cart.
2.  Apply the fixed-value coupon.
3.  Click "Finalize Purchase".
**Expected Result:** The system must prevent the user from proceeding and should redirect to the login page or display a message stating that authentication is required to continue.

**ID:** CT-012

**Title:** Authenticated user attempts to add an out-of-stock product
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Pairwise Testing
**Description:** Validates the interaction between: User Status (Authenticated), Stock (Unavailable), and Action (Add Item).
**Precondition:** The user is authenticated. The stock for a specific product is zero.
**Steps:**
1.  Locate the product with zero stock.
**Expected Result:** The "Add" button and the quantity field for this product must be disabled, preventing any attempt to add it to the cart. If interaction is possible, the system should display an error upon clicking "Add".

**ID:** CT-013

**Title:** Attempt to apply an expired discount coupon
**Test Type:** Functional
**Scenario:** Negative
**Technique Applied:** Equivalence Partitioning (Invalid)
**Description:** Validates that the system rejects coupon codes that exist in the database but have expired, ensuring proper time-based validation.
**Precondition:** The user has added a "Keyboard" (R$ 199.90) to the cart. An expired coupon "EXPIRED" exists in the system but is past its expiration date.
**Steps:**
1.  Navigate to the "Finalize Purchase" section.
2.  In the "Coupon code" field, enter "EXPIRED".
3.  Click "Apply Coupon".
**Expected Result:** The system should display a clear error message, such as "Coupon is expired". The purchase total should remain unchanged at R$ 199.90.