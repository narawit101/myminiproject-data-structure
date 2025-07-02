-- Create TargetGroup table first
CREATE TABLE TargetGroup (
    target_group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Create Citizens table
CREATE TABLE Citizens (
    citizen_id SERIAL PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    national_id VARCHAR(13) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    age INT NOT NULL,
    income DECIMAL(15,2) NOT NULL,
    occupation VARCHAR(100),
    target_group_id INT REFERENCES TargetGroup(target_group_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BudgetConfig table
CREATE TABLE BudgetConfig (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL CHECK (year >= 2000),
    project_name VARCHAR(255) NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL CHECK (total_budget > 0),
    remaining_budget DECIMAL(15,2) NOT NULL CHECK (remaining_budget >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AllocationRatio table
CREATE TABLE AllocationRatio (
    id SERIAL PRIMARY KEY,
    target_group_id INT REFERENCES TargetGroup(target_group_id) ON DELETE CASCADE,
    budget_id INT REFERENCES BudgetConfig(id) ON DELETE CASCADE,
    allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage > 0),
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_recipients INT NOT NULL CHECK (max_recipients > 0)
);

-- Create FundDistributionSchedule table
CREATE TABLE FundDistributionSchedule (
    id SERIAL PRIMARY KEY,
    target_group_id INT REFERENCES TargetGroup(target_group_id) ON DELETE CASCADE,
    distribution_date DATE NOT NULL
);

-- Create Transaction table
CREATE TABLE Transaction (
    transaction_id SERIAL PRIMARY KEY,
    citizen_id INT REFERENCES Citizens(citizen_id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    queue_order SERIAL
);
