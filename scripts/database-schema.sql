-- Create database
CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    reset_code VARCHAR(6),
    reset_code_expires DATETIME,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('private', 'group') NOT NULL,
    name VARCHAR(100), -- For group chats
    description TEXT, -- For group chats
    group_picture VARCHAR(255), -- For group chats
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Conversation participants
CREATE TABLE conversation_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT,
    message_type ENUM('text', 'image', 'emoji') DEFAULT 'text',
    file_url VARCHAR(255),
    reply_to_message_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Message status table
CREATE TABLE message_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user (message_id, user_id)
);

-- Stories table
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    story_type ENUM('text', 'image', 'video') NOT NULL,
    file_url VARCHAR(255),
    background_color VARCHAR(7), -- For text stories
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Story views table
CREATE TABLE story_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT NOT NULL,
    viewer_id INT NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_story_viewer (story_id, viewer_id)
);

-- Indexes for better performance
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_stories_user_expires ON stories(user_id, expires_at);
CREATE INDEX idx_message_status_message ON message_status(message_id);
