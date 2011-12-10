
function LinkedList(){
	this.front_ = null;
};

LinkedList.prototype.front = function()
{
	return this.front_;
}
LinkedList.prototype.push_front = function(val)
{
	var n = new ListNode(this);
	n.val = val;
	n.next = this.front_;
	this.front_ = n;
}


function ListNode(list){
	this.next = null;
	this.prev = null;
	this.val = null;
	this.list = list;
};

ListNode.prototype.get = function()
{
	return this.val;
}

ListNode.prototype.erase = function()
{
	if(this == this.list.front())
		this.list.front_ = this.next;
	if(this.prev != null)
		this.prev.next = this.next;
	if(this.next != null)
	{
		this.next.prev = this.prev;
		return this.next;
	}
	return null;
}
ListNode.prototype.insert = function(value)
{
	var n = new ListNode(this.list);
	n.val = value;

	n.next = this;
	n.prev = this.prev;
	if(n.prev != null)
		n.prev.next = n;
	n.next.prev = n;
	
	if(this == this.list.front())
		this.list.front_ = n;
}

ListNode.prototype.insert_after = function(value)
{
	var n = new ListNode(this.list);
	n.val = value;

	n.next = this.next;
	n.prev = this;
	n.prev.next = n;
	if(n.next != null)
		n.next.prev = n;
}

