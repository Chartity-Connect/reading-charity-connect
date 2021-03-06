SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `audit` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `audit_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` varchar(30) NOT NULL,
  `object` varchar(30) NOT NULL,
  `key_id` int(11) DEFAULT NULL,
  `key_code` varchar(30) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(2000) DEFAULT NULL,
  `postcode` varchar(8) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `client_links` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  `link_type` varchar(30) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `client_needs` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `requesting_organization_id` int(11) DEFAULT NULL,
  `type_id` int(11) NOT NULL,
  `date_needed` date DEFAULT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `need_met` varchar(1) NOT NULL DEFAULT 'N',
  `fulfilling_need_request_id` int(11) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `client_share_requests` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `requesting_organization_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `approved` char(1) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `crontab` (
  `id` int(11) NOT NULL,
  `cron` varchar(40) NOT NULL,
  `command` varchar(4000) NOT NULL,
  `last_run` datetime DEFAULT NULL,
  `shell` varchar(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

REPLACE INTO `crontab` (`id`, `cron`, `command`, `last_run`, `shell`) VALUES
(1, '0 8 * * *', 'overdue_email.php', NULL, 'N');

CREATE TABLE `need_requests` (
  `id` int(11) NOT NULL,
  `client_need_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `offer_id` int(11) DEFAULT NULL,
  `confirmation_code` varchar(60) COLLATE utf8_unicode_ci NOT NULL,
  `agreed` char(1) COLLATE utf8_unicode_ci DEFAULT NULL,
  `fulfilled_elsewhere` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `complete` char(1) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'N',
  `target_date` date DEFAULT NULL,
  `notes` varchar(2000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type_id` int(11) NOT NULL,
  `details` varchar(2000) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `quantity_taken` int(11) NOT NULL DEFAULT '0',
  `date_available` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `postcode` varchar(10) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `distance` decimal(5,1) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `offer_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL,
  `default_text` varchar(2000) DEFAULT NULL,
  `active` varchar(1) NOT NULL DEFAULT 'Y',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

REPLACE INTO `offer_types` (`id`, `name`, `category_id`, `default_text`, `active`, `creation_date`, `created_by`, `update_date`, `updated_by`) VALUES
(1, 'Companionship visit', 4, 'Suitable times: ', 'Y', '2020-06-30 09:51:46', 1, '2020-07-08 22:13:17', 1),
(2, 'Help with cooking', 6, NULL, 'Y', '2020-05-31 14:20:17', NULL, '2020-07-08 22:13:17', NULL),
(3, 'Food Parcel', 6, NULL, 'Y', '2020-05-31 14:20:17', NULL, '2020-07-08 22:13:17', NULL),
(4, 'Home', 1, '', 'Y', '2020-07-07 09:04:56', 1, '2020-07-08 22:13:17', 1),
(5, 'CV help', 2, '', 'Y', '2020-07-07 09:07:43', 31, '2020-07-08 22:13:17', 31),
(6, 'Phone', 1, '', 'Y', '2020-07-07 09:04:42', 1, '2020-07-08 22:13:17', 1),
(7, 'Prescription Collection', 8, NULL, 'Y', '2020-05-31 14:20:17', NULL, '2020-07-08 22:13:17', NULL),
(8, 'ReadiFood Referral', 6, 'Please complete the following fields so that we can submit the request automatically. Fields with a * next to them must be completed. Any optional fields not completed will be set to No.\n\n* Reason for food parcel request: \n\nHome Delivery (Y/N):\n\nFood Preferences\nNo Cooking Facilities (Y/N):\nVegetarian (Y/N):\nHalal (Y/N):\nDiabetic (Y/N):\nGluten Free (Y/N):\nOther:\n\n* Number of weeks (1-4):\n\nAdditional Items\nNappies (Y/N):\nNappy Size:\nBaby Toiletries (Y/N):\nBaby Food 4-6m (Y/N):\nBaby Food 7-12m (Y/N):\nOther:\n\n* Number of Adults (0-5):\n* Number of Children (0-5):\nAge and gender of Children: ', 'Y', '2020-05-31 14:20:17', NULL, '2020-07-08 22:13:17', NULL);

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(2000) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `enabled` varchar(1) NOT NULL DEFAULT 'Y',
  `approver_email` varchar(255) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

REPLACE INTO `roles` (`id`, `name`, `creation_date`, `created_by`, `update_date`, `updated_by`) VALUES
(1, 'admin', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL);

CREATE TABLE `strings` (
  `code` varchar(30) NOT NULL,
  `string` mediumtext NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

REPLACE INTO `strings` (`code`, `string`, `creation_date`, `created_by`, `update_date`, `updated_by`) VALUES
('client_share_body', '<p>Another Reading Charity Connect organisation, %SOURCE_ORGANISATION%, has requested permission to jointly manage one of your clients. %CLIENT_NAME%. This helps to makes sure that different organisations don\'t create duplicate requests for help for %CLIENT_NAME%, and allows them to have a full picture of their support. However, it does allow them to view and manage the name, address, phone number, e-mail address and notes about %CLIENT_NAME%, so you should only share the information if you are happy that it is appropriate.</p>\r\n\r\n<p>Visit <a href=\"%LINK%\">%LINK%</a> to accept or reject this request.</p>', '2020-06-06 22:04:23', NULL, '2020-06-06 22:04:23', NULL),
('client_share_subject', 'Reading Charity Connect Client Share Request (%CLIENT_NAME%)', '2020-06-06 22:04:23', NULL, '2020-06-06 22:04:23', NULL),
('need_request_body', '<p>%USER_NAME%,</p>\r\n<p>A request has come in from %SOURCE_ORG_NAME% to help %CLIENT_NAME%, which we believe %TARGET_ORG_NAME% can provide. The details of the request are;</p>\r\n<p>Name: %CLIENT_NAME%<br/>\r\nAddress:<br/>\r\n%CLIENT_ADDRESS%<br/>\r\n%CLIENT_POSTCODE%<br>\r\n<br/>\r\nRequest Type:%REQUEST_TYPE%<br/>\r\nDate Needed:%DATE_NEEDED%<br/>\r\nNotes:<br/>\r\n%NOTES%</p>\r\n<p>If you can confirm that you can provide this, please click here;</p>\r\n<p><a href=\"%LINK%\">%LINK%</a></p>\r\n<p>Thanks for your help</p>', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL),
('need_request_subject', 'Request for help from Reading Charity Connect', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL),
('need_req_changed_body', '<p>%USER_NAME%,</p>\r\n<p>There has been a change to a request for help from at Reading Charity Connect that you had previously agreed to help with. You had agreed to help %CLIENT_NAME% for %SOURCE_ORG_NAME% by providing %REQUEST_TYPE_ORIG% on %TARGET_DATE%. This original request is no longer valid, so we have removed it. If the updated request is also something you can help with you will receive a separate e-mail asking for assistance, and we would appreciate your help still.</p>', '2020-07-06 10:56:10', NULL, '2020-07-07 20:09:11', NULL),
('need_req_changed_subject', 'Reading Charity Connect Request Changed', '2020-07-06 10:56:10', NULL, '2020-07-06 10:56:10', NULL),
('new_org_confirmed_body', '<p>Dear %NAME%,</p>\r\n<p>Your request to join the %ORGANIZATION_NAME% team at Reading Charity Connect has been confirmed. You can now log in at <a href=\"%LINK%\">%LINK%</a> to access this organization. If you are a member of multiple organisations, you may need to switch between organisations using the dropdown list at the top of the page.</p>', '2020-06-09 19:06:37', NULL, '2020-07-06 10:56:10', NULL),
('new_org_confirmed_subject', 'Reading Charity Connect: %ORGANIZATION_NAME% membership confirmed ', '2020-06-09 19:06:37', NULL, '2020-07-06 10:56:10', NULL),
('new_org_user_confirmation', '<p>A new user has registered for your organization on Reading Charity Connect;</p>\r\n<p>Name: %NAME%</p>\r\n<p>Email: %EMAIL%</p>\r\n<p>If you want to add this user to your organization, click <a href=\"%LINK%\">here</a>. If you do not recognize this user, simply ignore this e-mail.</p> ', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL),
('new_org_user_subject', 'New User Registered at Reading Charity Connect', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL),
('new_user_confirmation', '<p>%NAME%,</p>\r\n\r\n<p>welcome to Reading Charity Connect. To confirm your account, click <a href=\"%LINK%\">here</a>. If you did not sign up for an account, please ignore this e-mail.</p>', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL),
('new_user_subject', 'Please confirm your account', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL),
('overdue_body', '<p>%USER_NAME%,<p>\r\n<p>There are overdue actions for %ORGANIZATION_NAME% at Reading Charity Connect. Hopefully you have already completed these actions but not yet updated the system. If you have finished them, please mark them as completed. If you still need to take some action, please complete that ASAP.<p>\r\n<p>%ACTION_TABLE%</p>', '2020-06-14 09:07:10', NULL, '2020-07-06 10:56:10', NULL),
('overdue_subject', 'Reading Charity Connect: Overdue actions for %ORGANIZATION_NAME%', '2020-06-14 09:07:10', NULL, '2020-07-06 10:56:10', NULL),
('password_reset_body', '<p>To reset your password at Reading Charity Connect, click on the following link.</p>\r\n<p><a href=\"%LINK%\">%LINK%</a></p>\r\n<p>If you did not request to reset your password, ignore this e-mail.</p>', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL),
('password_reset_subject', 'Reading Charity Connect Password Reset', '2020-05-31 14:20:17', NULL, '2020-07-06 10:56:10', NULL);

CREATE TABLE `type_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `active` varchar(1) NOT NULL DEFAULT 'Y',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

REPLACE INTO `type_categories` (`id`, `name`, `active`, `creation_date`, `created_by`, `update_date`, `updated_by`) VALUES
(1, 'Befriending', 'Y', '2020-06-30 15:10:52', NULL, '2020-06-30 15:10:52', NULL),
(2, 'Benefits advice', 'Y', '2020-06-30 15:11:45', NULL, '2020-06-30 15:11:45', NULL),
(3, 'Carer support', 'Y', '2020-06-30 15:11:20', NULL, '2020-06-30 15:11:20', NULL),
(4, 'Company and visits', 'Y', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL),
(5, 'Support to employment', 'Y', '2020-06-30 15:10:52', NULL, '2020-06-30 15:10:52', NULL),
(6, 'Food', 'Y', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL),
(7, 'Food parcel', 'Y', '2020-06-30 15:11:45', NULL, '2020-06-30 15:11:45', NULL),
(8, 'Medical', 'Y', '2020-05-31 14:20:17', NULL, '2020-05-31 14:20:17', NULL),
(9, 'Mental health and wellbeing', 'Y', '2020-06-30 15:11:20', NULL, '2020-06-30 15:11:20', NULL),
(10, 'Shopping', 'Y', '2020-06-30 15:11:56', NULL, '2020-06-30 15:11:56', NULL);

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `display_name` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `confirmed` char(1) NOT NULL DEFAULT 'N',
  `confirmation_string` varchar(60) DEFAULT NULL,
  `password_confirmation_string` varchar(60) DEFAULT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_organizations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `admin` char(1) NOT NULL DEFAULT 'N',
  `user_approver` char(1) NOT NULL DEFAULT 'N',
  `need_approver` char(1) NOT NULL DEFAULT 'N',
  `manage_offers` char(1) NOT NULL DEFAULT 'Y',
  `manage_clients` char(1) NOT NULL DEFAULT 'Y',
  `client_share_approver` char(1) NOT NULL DEFAULT 'N',
  `dbs_check` char(1) NOT NULL DEFAULT 'U',
  `confirmed` char(1) NOT NULL DEFAULT 'N',
  `confirmation_string` varchar(60) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_date` (`audit_date`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `client_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_link` (`link_id`,`link_type`,`client_id`),
  ADD KEY `client_id` (`client_id`);

ALTER TABLE `client_needs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

ALTER TABLE `client_share_requests`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `crontab`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `need_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_need_id` (`client_need_id`);

ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offer_organization` (`organization_id`);

ALTER TABLE `offer_types`
  ADD PRIMARY KEY (`id`) USING BTREE;

ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `strings`
  ADD PRIMARY KEY (`code`);

ALTER TABLE `type_categories`
  ADD PRIMARY KEY (`id`) USING BTREE;

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user_organizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_orgs` (`user_id`) USING BTREE,
  ADD KEY `org_users` (`organization_id`) USING BTREE;

ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `client_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `client_needs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `client_share_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `crontab`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `need_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `offer_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `type_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
