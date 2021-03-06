<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Organization.php';

global $connection;
// Initialize the session
session_start();

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();
$organization = new Organization($connection);
$registered=false;


// Define variables and initialize with empty values
$email = $name = $password = $confirm_password = "";
$email_err =$name_err = $password_err = $confirm_password_err = "";

// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    // Validate email
    if(empty(trim($_POST["email"]))){
        $email_err = "Please enter a email.";
    } else{
        // Prepare a select statement
        $sql = "SELECT id FROM users WHERE email = :email";

		$stmt= $connection->prepare($sql);
            // Set parameters
            $param_email = trim($_POST["email"]);

            // Attempt to execute the prepared statement
            if($stmt->execute(['email'=>$param_email])){

                if($stmt->rowCount() == 1){
                    $email_err = "This email is already in use.";
                } else{
                    $email = trim($_POST["email"]);
                }
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }

    }

    // Validate name
    if(empty(trim($_POST["name"]))){
        $name_err = "Please enter your name.";
    } else{
        $name = trim($_POST["name"]);
    }

    // Validate password
    if(empty(trim($_POST["password"]))){
        $password_err = "Please enter a password.";
    } elseif(strlen(trim($_POST["password"])) < 8){
        $password_err = "Password must have at least 8 characters.";
    } else{
        $password = trim($_POST["password"]);
    }

    // Validate confirm password
    if(empty(trim($_POST["confirm_password"]))){
        $confirm_password_err = "Please confirm password.";
    } else{
        $confirm_password = trim($_POST["confirm_password"]);
        if(empty($password_err) && ($password != $confirm_password)){
            $confirm_password_err = "Password did not match.";
        }
    }

    $organization_id=$_POST["organization"];
    // Check input errors before inserting in database
    if(empty($email_err) && empty($password_err) && empty($confirm_password_err)){
        $user = new User($connection);
        $user->email=$email;
        $user->display_name=$name;
        $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        $id=$user->create($organization_id);
        if($id>0){
        	$registered=true;

        }else{
                echo "Something went wrong. Please try again later.";
        }

    }

}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign Up</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.css">
    <style type="text/css">
        body{ font: 14px sans-serif; }
        .wrapper{ padding: 20px; text-align: center; }
        .loginFields{ max-width: 350px; margin: auto;}
        label{ text-align: left;}
    </style>
</head>
<body>

    <div class="wrapper">
            <h2 class="oj-sm-only-hide oj-web-applayout-header-title" title="Application Name"><img src="/images/handshake.png" alt="logo"/>
Reading Charity Connect - Sign Up</h2>
<?php if($registered) : ?>
<div id="confirmMessage" >
<h2>Thanks for creating your account. You will shortly receive an e-mail asking you to confirm your account. Click on the link to confirm and log in.</h2>
</div>
<?php else : ?>
<div id="signupForm">
        <p>Please fill this form to create an account.</p>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" class="loginFields">
            <div class="form-group <?php echo (!empty($name_err)) ? 'has-error' : ''; ?>">
                <label>Name</label>
                <input type="text" name="name" class="form-control" value="<?php echo $name; ?>">
                <span class="help-block"><?php echo $name_err; ?></span>
            </div>
            <div class="form-group <?php echo (!empty($email_err)) ? 'has-error' : ''; ?>">
                <label>E-mail address</label>
                <input type="email" name="email" class="form-control" value="<?php echo $email; ?>">
                <span class="help-block"><?php echo $email_err; ?></span>
            </div>
            <div class="form-group <?php echo (!empty($password_err)) ? 'has-error' : ''; ?>">
                <label>Password</label>
                <input type="password" name="password" class="form-control" value="<?php echo $password; ?>">
                <span class="help-block"><?php echo $password_err; ?></span>
            </div>
            <div class="form-group <?php echo (!empty($confirm_password_err)) ? 'has-error' : ''; ?>">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" class="form-control" value="<?php echo $confirm_password; ?>">
                <span class="help-block"><?php echo $confirm_password_err; ?></span>
            </div>
            <div class="form-group">
                <label>Organization</label><br/>
                <select id="organization" name="organization" class="form-control" >
                <?php
                    $stmt = $organization->readActive();
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                    	if(isset($organization_id)&&$organization_id==$row['id']){
                        	echo "<option value=\"".$row['id']."\" selected=\"selected\">".$row['name']."</option>";
						} else {
                        	echo "<option value=\"".$row['id']."\">".$row['name']."</option>";
                        }
                    }
                    ?>
                </select>
            </div>
            <div class="form-group">
                <input type="submit" class="btn btn-primary" value="Submit" style="width:45%">
                <input type="reset" class="btn btn-default" value="Reset" style="width:45%">
            </div>
            <p>Already have an account? <a href="/index.html">Login here</a>.</p>
        </form>
        </div>
<?php endif; ?>
    </div>
</body>
</html>