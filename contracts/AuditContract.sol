// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditContract {
    struct AuditRecord {
        string codeHash;
        address auditor;
        uint256 timestamp;
    }

    mapping(uint256 => AuditRecord) public auditRecords;
    uint256 public recordCount;
    uint256 public auditFee;
    address public owner;

    event AuditRecorded(uint256 indexed recordId, string codeHash, address indexed auditor, uint256 timestamp);
    event AuditFeeSet(uint256 newFee);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event Withdrawn(uint256 amount);

    constructor() {
        owner = msg.sender;
        auditFee = 0; // 初始审计费用设为 0
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    function uploadAuditRecord(string memory _codeHash) public payable {
        require(msg.value >= auditFee, "Insufficient audit fee");
        
        unchecked {
            recordCount++;
        }
        auditRecords[recordCount] = AuditRecord(_codeHash, msg.sender, block.timestamp);

        emit AuditRecorded(recordCount, _codeHash, msg.sender, block.timestamp);
    }

    function setAuditFee(uint256 _newFee) public onlyOwner {
        auditFee = _newFee;
        emit AuditFeeSet(_newFee);
    }

    function changeOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnerChanged(oldOwner, _newOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(amount);
    }

    function getAuditRecord(uint256 _recordId) public view returns (AuditRecord memory) {
        require(_recordId > 0 && _recordId <= recordCount, "Invalid record ID");
        return auditRecords[_recordId];
    }
}