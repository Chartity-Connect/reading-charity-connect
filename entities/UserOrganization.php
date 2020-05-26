<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';
class UserOrganization{

    private $connection;

    // table columns
    public $id;
    public $user_id;
    public $organization_id;
    public $admin;
    public $user_approver;
    public $need_approver;
    public $confirmed='N';
    private $confirmation_string;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
        $sql = "INSERT INTO user_organizations ( user_id,organization_id,admin,user_approver,need_approver,confirmed,confirmation_string) values (:user_id,:organization_id,:admin,:user_approver,:need_approver,:confirmed,:confirmation_string)";
        $stmt= $this->connection->prepare($sql);
        $this->confirmation_string=generate_string(60);

        if( $stmt->execute(['user_id'=>$this->user_id,'organization_id'=>$_SESSION['organization_id'],'admin'=>$this->admin,'user_approver'=>$this->user_approver,'need_approver'=>$this->need_approver,'confirmed'=>$this->confirmed,'confirmation_string'=>$this->confirmation_string])){
            $this->id=$this->connection->lastInsertId();
            if($this->confirmed=='N'){
            	$user= new User($this->connection);
				$user->forceRead($this->user_id);

            	$messageString=get_string("new_org_user_confirmation",array("%NAME%"=>$user->display_name,"%EMAIL%"=>$user->email,"%LINK%"=>$site_address."/rest/confirm_user_organization.php?id=".$this->id."&key=".$this->confirmation_string));
            	$stmt=$this->readAllUserApprovers($this->organization_id);
            	while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            		sendHtmlMail($row['email'],get_string("new_org_user_subject"),$messageString);
            	}
            }

            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
			$query = "SELECT uo.id,uo.user_id,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.confirmed, org.name as organization_name from user_organizations uo, organization org where uo.organization_id=org.id ORDER BY uo.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute();
	    } else if(is_org_admin()){
	       	$organization_id=$_SESSION["organization_id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,confirmed from user_organizations where organization_id=:organization_id ORDER BY id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$organization_id]);
		} else {
			$user_id=$_SESSION["id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,confirmed from user_organizations where user_id=:user_id ORDER BY id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['user_id'=>$user_id]);
		}
        return $stmt;
    }

    public function readAllOrganization($organization_id){
        $query = "SELECT uo.id,uo.user_id,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.confirmed from user_organizations uo where organization_id=:organization_id ORDER BY uo.id";
        $stmt = $this->connection->prepare($query);
        $stmt->execute(['organization_id'=>$organization_id]);
        return $stmt;
    }

    public function readAllUser($user_id){
        $query = "SELECT uo.id,uo.user_id,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.confirmed, org.name as organization_name from user_organizations uo, organizations org where org.id=uo.organization_id and user_id=:id ORDER BY uo.id";
        $stmt = $this->connection->prepare($query);
        $stmt->execute(['id'=>$user_id]);
        return $stmt;
    }

    public function readAllUserApprovers($organization_id){
        $query = "SELECT u.id,u.email from user_organizations o, users u where o.user_id=u.id and o.organization_id=:id and o.user_approver='Y' and o.confirmed='Y'";
        $stmt = $this->connection->prepare($query);
        $stmt->execute(['id'=>$organization_id]);
        return $stmt;
    }

    public function readAllNeedApprovers($organization_id){
        $query = "SELECT u.id,u.email from user_organizations o, users u where o.user_id=u.id and o.organization_id=:id and o.need_approver='Y' and o.confirmed='Y'";
        $stmt = $this->connection->prepare($query);
        $stmt->execute(['id'=>$organization_id]);
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->user_id=$row['user_id'];
        $this->organization_id=$row['organization_id'];
        $this->admin=$row['admin'];
        $this->user_approver=$row['user_approver'];
        $this->need_approver=$row['need_approver'];
        $this->confirmed=$row['confirmed'];
        $this->confirmation_string=$row['confirmation_string'];
   }

    public function readOne($id){
        if(is_admin()){
	        $query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,confirmed,confirmation_string from user_organizations where id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	    } else if(is_org_admin()){
	       	$organization_id=$_SESSION["organization_id"];
	        $query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,confirmed,confirmation_string from user_organizations where organization_id=:organization_id and id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$organization_id,'id'=>$id]);
	    } else {
			$user_id=$_SESSION["id"];
	        $query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,confirmed,confirmation_string from user_organizations where user_id=:user_id and id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['user_id'=>$user_id,'id'=>$id]);
	    }
	        return $stmt;
	}

    public function update(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "UPDATE user_organizations SET user_id=:user_id, organization_id=:organization_id, admin=:admin, user_approver=:user_approver, need_approver=:need_approver WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id,'user_id'=>$this->user_id,'organization_id'=>$this->organization_id,'admin'=>$this->admin,'user_approver'=>$this->user_approver,'need_approver'=>$this->need_approver]);
		} else {
			return false;
		}
    }

    public function delete(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM user_organizations WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

    }

	public function confirmUserOrganization($confirmation_string){
		if($confirmation_string==$this->confirmation_string){
			$sql = "UPDATE user_organizations SET confirmed='Y' WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}
	}

}
