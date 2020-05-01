<?php
class Offer{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    public $organization_id;
    public $name;
    public $type;
    public $type_name;
    public $details;
    public $quantity;
    public $date_available;
    public $date_end;
    public $postcode;
    private $latitude;
    private $longitude;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
    	if(isset($this->postcode)&&$this->postcode!=""){
		$url='http://api.getthedata.com/postcode/'.urlencode($this->postcode);
    		$location_str = file_get_contents($url);
    		$location = json_decode ($location_str);
    		if($location->{"status"}=="match"){
    		  $longitude=$location->{'data'}->{'longitude'};
    		  $latitude=$location->{'data'}->{'latitude'};
        		$sql = "INSERT INTO offers (organization_id, 
name,type,details,quantity,date_available,date_end,postcode,latitude,longitude) values 
(:organization_id,:name,:type,:details,:quantity,:date_available,:date_end,:postcode,:latitude,:longitude)";
        		$stmt= $this->connection->prepare($sql);
        		if( $stmt->execute(['organization_id'=>$this->organization_id,'name'=>$this->name,'type'=>$this->type,'details'=>$this->details,'quantity'=>$this->quantity,'date_available'=>$this->date_available,'date_end'=>$this->date_end,'postcode'=>$this->postcode,'latitude'=>$latitude,'longitude'=>$longitude])){
            		$this->id=$this->connection->lastInsertId();
            		return $this->id;
        		} else {
            		return -1;
        		}
    		}
    	}
        $sql = "INSERT INTO offers (organization_id, name,type,details,quantity,date_available,date_end,postcode) values 
(:organization_id,:name,:type,:details,:quantity,:date_available,:date_end,:postcode)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['organization_id'=>$this->organization_id,'name'=>$this->name,'type'=>$this->type,'details'=>$this->details,'quantity'=>$this->quantity,'date_available'=>$this->date_available,'date_end'=>$this->date_end,'postcode'=>$this->postcode,])){
            $this->id=$this->connection->lastInsertId();
            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
            $query = "SELECT o.id,o.organization_id, o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode from offers o , offer_types t where o.type=t.type ORDER BY o.id";
       		$stmt = $this->connection->prepare($query);
       		$stmt->execute();
        } else {
	        $query = "SELECT o.id,o.organization_id, o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode from offers o, users u, offer_types t where o.organization_id=u.organization_id and u.id=:user_id and o.type=t.type ORDER BY o.id";
			$stmt = $this->connection->prepare($query);
	        $stmt->execute(['user_id'=>$_SESSION["id"]]);
        }
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->organization_id=$row['organization_id'];
        $this->name=$row['name'];
        $this->type=$row['type'];
        $this->type_name=$row['type_name'];
        $this->details=$row['details'];
        $this->quantity=$row['quantity'];
        $this->date_available=$row['date_available'];
        $this->postcode=$row['postcode'];
        $this->postcode=$row['postcode'];
  }

    public function readOne($id){
        if(is_admin()){
	        $query = "SELECT o.id,o.organization_id,o.name,o.type,t.name as type_name, o.details,o.quantity,o.date_available, o.date_end, o.postcode from offers o, offer_types t where o.type=t.type and o.id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	    } else {
	        $query = "SELECT o.id,o.organization_id,o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode from offers o , users u, offer_types t where o.organization_id=u.organization_id and u.id=:user_id and o.type=t.type and o.id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id,'user_id'=>$_SESSION["id"]]);
	    }
	        return $stmt;
	    }

    public function update(){

    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
        	$sql = "UPDATE offers SET organization_id=:organization_id,name=:name, type=:type, details=:details, quantity=:quantity,date_available=:date_available,date_end=:date_end,postcode=:postcode WHERE id=:id";
        	$stmt= $this->connection->prepare($sql);
        	return $stmt->execute(['id'=>$this->id,'organization_id'=>$this->organization_id,'name'=>$this->name,'type'=>$this->type,'details'=>$this->details,'quantity'=>$this->quantity,'date_available'=>$this->date_available,'date_end'=>$this->date_end,'postcode'=>$this->postcode]);
        } else {
        	return false;
        }
    }

    public function delete(){
    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
	        $sql = "DELETE FROM offers WHERE id=:id";
        	$stmt= $this->connection->prepare($sql);
        	return $stmt->execute(['id'=>$this->id]);
        } else {
        	return false;
        }

    }
}
