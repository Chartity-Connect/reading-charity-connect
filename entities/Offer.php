<?php
require_once __DIR__.'/Audit.php';
class Offer{

	private $connection;

	public $id;
	public $organization_id;
	public $organization_name;
	public $name;
	public $type_id;
	public $type_name;
	public $category_id;
	public $details;
	public $quantity;
	public $quantity_taken;
	public $quantity_available;
	public $date_available;
	public $date_end;
	public $postcode;
	private $latitude;
	private $longitude;
	public $distance;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

		private $base_query = "SELECT o.id
		,o.organization_id
		,org.name as organization_name
		,o.name
		,o.type_id
		,t.name as type_name
		,t.category_id
		,o.details
		,o.quantity
		,o.quantity_taken
		,(o.quantity-o.quantity_taken) as quantity_available
		,o.date_available
		,o.date_end
		,o.postcode
		,o.latitude
		,o.longitude
		,o.distance
		,o.creation_date
		,COALESCE(create_user.display_name,'System') as created_by
		,o.update_date
		,COALESCE(update_user.display_name,'System') as updated_by 
		from offers o
		left join users create_user on create_user.id=o.created_by
		left join users update_user on update_user.id=o.updated_by
		,offer_types t
		,organizations org
		where o.type_id=t.id
		and o.organization_id=org.id ";


	public function create(){

		$this->organization_id=$_SESSION["organization_id"];
		if(isset($this->postcode)&&$this->postcode!=""){
			list($latitude,$longitude)=getGeocode($this->postcode);
		} else {
			$latitude=null;
			$longitude=null;
		}

		$sql = "INSERT INTO offers (organization_id,name,type_id,details,quantity,date_available,date_end,postcode,latitude,longitude,distance,created_by,updated_by) values
			(:organization_id,:name,:type_id,:details,:quantity,:date_available,:date_end,:postcode,:latitude,:longitude,:distance,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['organization_id'=>$this->organization_id
			,'name'=>$this->name
			,'type_id'=>$this->type_id
			,'details'=>$this->details
			,'quantity'=>$this->quantity
			,'date_available'=>$this->date_available
			,'date_end'=>($this->date_end==="")?null:$this->date_end
			,'postcode'=>$this->postcode
			,'latitude'=>($latitude==-1) ? null:$latitude
			,'longitude'=>($latitude==-1) ? null:$longitude
			,'distance'=>$this->distance
			,'user_id'=>$_SESSION['id']
			])){
			$this->id=$this->connection->lastInsertId();
			Audit::add($this->connection,"create","offer",$this->id,null,$this->name);
			$this->creation_date=date("Y-m-d H:i:s");
			$this->created_by=$_SESSION['display_name'];
			$this->update_date=date("Y-m-d H:i:s");
			$this->updated_by=$_SESSION['display_name'];
			return $this->id;
		} else {
			return -1;
		}

	}
	public function readAll(){
		if(is_admin()&&$_SESSION["view_all"]){
			$query = $this->base_query." ORDER BY o.id";
	   		$stmt = $this->connection->prepare($query);
	   		$stmt->execute();
		} else {
			$query = $this->base_query." and o.organization_id=:organization_id ORDER BY o.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
		}
		return $stmt;
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->organization_id=$row['organization_id'];
		$this->organization_name=$row['organization_name'];
		$this->name=$row['name'];
		$this->type_id=$row['type_id'];
		$this->type_name=$row['type_name'];
		$this->category_id=$row['category_id'];
		$this->details=$row['details'];
		$this->quantity=$row['quantity'];
		$this->quantity_taken=$row['quantity_taken'];
		$this->quantity_available=$row['quantity_available'];
		$this->date_available=$row['date_available'];
		$this->date_end=$row['date_end'];
		$this->postcode=$row['postcode'];
		$this->latitude=$row['latitude'];
		$this->longitude=$row['longitude'];
		$this->distance=$row['distance'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
  }

	public function readOne($id){
		if(is_admin()&&$_SESSION["view_all"]){
			$query = $this->base_query." and o.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
		} else {
			$query = $this->base_query." and o.organization_id=:organization_id and o.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
		}
			return $stmt;
	}

	public function getLatitude(){
		return $this->latitude;
	}
	public function getLongitude(){
		return $this->longitude;
	}
	public function update(){

		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){

			$offerOrig=new Offer($this->connection);
			$offerOrig->id=$this->id;
			$offerOrig->read();
			if($offerOrig->postcode!=$this->postcode&&isset($this->postcode)&&$this->postcode!=""){
				list($latitude,$longitude)=getGeocode($this->postcode);
			} else {
				$latitude=$offerOrig->getLatitude();
				$longitude=$offerOrig->getLongitude();
			}

			$sql = "UPDATE offers SET name=:name, type_id=:type_id, details=:details, quantity=:quantity,date_available=:date_available,date_end=:date_end,postcode=:postcode,latitude=:latitude,longitude=:longitude,distance=:distance,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id,'name'=>$this->name,'type_id'=>$this->type_id,'details'=>$this->details,'quantity'=>$this->quantity,'date_available'=>$this->date_available,'date_end'=>$this->date_end,'postcode'=>$this->postcode
				,'latitude'=>($latitude==-1) ? null:$latitude
				,'longitude'=>($latitude==-1) ? null:$longitude
				,'distance'=>$this->distance
				,'updated_by'=>$_SESSION['id']

			])){
				return Audit::add($this->connection,"update","offer",$this->id,null,$this->name);
			}
		} 
		return false;
	}
	public function delete(){
        $stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$this->connection->beginTransaction();		
			$stmt= $this->connection->prepare("DELETE FROM offers WHERE id=:id"); 
			$stmt->execute(['id'=>$this->id]);
			$stmt= $this->connection->prepare("DELETE FROM need_requests WHERE offer_id=:id");
			$stmt->execute(['id'=>$this->id]);
			$stmt->closeCursor();
			Audit::add($this->connection,"delete","offer",$this->id);
			return $this->connection->commit();
		} else {
			$this->connection->rollBack();
			return false;
		}
		return false;
	}
}
