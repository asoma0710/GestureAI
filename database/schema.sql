-- ============================================================
-- Create AppUsers table
-- This table stores user account information.
-- Each user has a unique userID (primary key), a unique username,
-- and a unique email. The password is stored (hashed) in the password field.
-- The profile_picture is stored as BYTEA (binary data).
-- is_active indicates whether the account is active.
-- ============================================================

CREATE TABLE AppUsers (
    userID SERIAL PRIMARY KEY,                         -- Auto-incremented primary key for users.
    username VARCHAR(255) UNIQUE NOT NULL,              -- Unique username; cannot be null.
    email VARCHAR(255) UNIQUE NOT NULL,                 -- Unique email address; cannot be null.
    password VARCHAR(255) NOT NULL,                     -- User password (expected to be stored in a hashed format).
    profile_picture BYTEA,                              -- Optional field to store binary data for the profile picture.
    is_active BOOLEAN NOT NULL DEFAULT true             -- Flag indicating if the user is active; defaults to true.
);

-- ============================================================
-- Create Admins table
-- This table stores admin-specific data.
-- Each admin record is linked to a user in the AppUsers table
-- using the userID as a foreign key.
-- ============================================================

CREATE TABLE Admins (
    adminID SERIAL PRIMARY KEY,                         -- Auto-incremented primary key for admin records.
    userID INT NOT NULL,                                -- Foreign key that references a user in AppUsers.
    FOREIGN KEY (userID) REFERENCES AppUsers(userID)    -- Enforces referential integrity: each admin must correspond to a valid user.
);

-- ============================================================
-- Create Feedback table
-- This table records feedback submitted by users.
-- Each feedback entry includes the user_id (referencing AppUsers),
-- the feedback content, the creation timestamp, and a flag indicating resolution.
-- ============================================================

CREATE TABLE Feedback (
    feedback_id SERIAL PRIMARY KEY,                     -- Auto-incremented primary key for feedback entries.
    user_id INT NOT NULL,                               -- References the user who submitted the feedback.
    content TEXT NOT NULL,                              -- The feedback message/content.
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- Automatically set timestamp when feedback is created.
    resolved BOOLEAN NOT NULL DEFAULT false,            -- Flag indicating whether the feedback has been resolved; defaults to false.
    FOREIGN KEY (user_id) REFERENCES AppUsers(userID)   -- Enforces that the feedback belongs to a valid user.
);

-- ============================================================
-- Create Merchandise table
-- This table stores information about merchandise items.
-- Each merchandise item has a unique ID, name, an optional picture (URL or path),
-- and a base price.
-- ============================================================

CREATE TABLE Merchandise (
    merchandise_id SERIAL PRIMARY KEY,                -- Auto-incremented primary key for merchandise items.
    name VARCHAR(255) NOT NULL,                         -- Name of the merchandise item; cannot be null.
    picture VARCHAR(255),                               -- URL or path to the merchandise image; optional.
    base_price FLOAT NOT NULL                           -- Base price of the merchandise item.
);

-- ============================================================
-- Create Subscriptions table
-- This table stores subscription plans.
-- Each subscription has a unique ID, a name, and a discount percentage.
-- ============================================================

CREATE TABLE Subscriptions (
    subscription_id SERIAL PRIMARY KEY,               -- Auto-incremented primary key for subscriptions.
    name VARCHAR(255) NOT NULL,                         -- Name of the subscription plan; cannot be null.
    discount_percentage INT NOT NULL                    -- Discount percentage provided by the subscription.
);

-- ============================================================
-- Create Purchases table
-- This table records purchase transactions.
-- Each purchase links a user (AppUsers), a merchandise item (Merchandise),
-- and optionally a subscription (Subscriptions). The final price is recorded.
-- ============================================================

CREATE TABLE Purchases (
    purchase_id SERIAL PRIMARY KEY,                   -- Auto-incremented primary key for purchase records.
    user_id INT NOT NULL,                             -- Foreign key referencing the user who made the purchase.
    merchandise_id INT NOT NULL,                      -- Foreign key referencing the purchased merchandise.
    subscription_id INT,                              -- Optional foreign key referencing the subscription applied.
    final_price FLOAT NOT NULL,                       -- Final price paid after applying any discounts.
    FOREIGN KEY (user_id) REFERENCES AppUsers(userID),  -- Ensures the user exists in the AppUsers table.
    FOREIGN KEY (merchandise_id) REFERENCES Merchandise(merchandise_id),  -- Ensures the merchandise exists.
    FOREIGN KEY (subscription_id) REFERENCES Subscriptions(subscription_id)  -- Ensures the subscription exists (if provided).
);

-- ============================================================
-- Create GestureAIModel table
-- This table stores details of AI models used in the application.
-- Each model has a unique ID, a name, a version string, and an accuracy metric.
-- ============================================================

CREATE TABLE GestureAIModel (
    modelID SERIAL PRIMARY KEY,                        -- Auto-incremented primary key for AI model records.
    modelName VARCHAR(255) NOT NULL,                    -- Name of the AI model.
    version VARCHAR(50) NOT NULL,                       -- Version of the AI model.
    accuracy FLOAT NOT NULL                             -- Accuracy metric of the model.
);
