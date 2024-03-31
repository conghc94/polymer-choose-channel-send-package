//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import './base/CustomChanIbcApp.sol';

contract StudentInfo is CustomChanIbcApp {
    // app specific state
    uint64 public counter;
    mapping (uint64 => address) public counterMap;
    mapping(address => bool) public addressMap;

    struct Student {
        string name;
        uint age;
    }

    mapping(address => Student) public students;

    event StudentAdded(address indexed studentAddress, string name, uint age);
    event LogQuery(address indexed caller, string query);
    event LogAcknowledgement(string message);

    function addOrUpdateStudent(string memory _name, uint _age) public {
        students[msg.sender] = Student(_name, _age);
        emit StudentAdded(msg.sender, _name, _age);
    }

    function getStudentInfo(address _studentAddress) public view returns (string memory, uint) {
        return (students[_studentAddress].name, students[_studentAddress].age);
    }

    constructor(IbcDispatcher _dispatcher) CustomChanIbcApp(_dispatcher) {}

    // app specific logic
    function resetCounter() internal {
        counter = 0;
    }

    function increment() internal {
        counter++;
    }

    // IBC logic

    /**
     * @dev Sends a packet with the caller address over a specified channel.
     * @param channelId The ID of the channel (locally) to send the packet to.
     * @param timeoutSeconds The timeout in seconds (relative).
     */

    function sendPacket( bytes32 channelId, uint64 timeoutSeconds) external {
        string memory name = students[msg.sender].name;

        // encoding the caller address to update counterMap on destination chain
        bytes memory payload = abi.encode(msg.sender, name);

        // setting the timeout timestamp at 10h from now
        uint64 timeoutTimestamp = uint64((block.timestamp + timeoutSeconds) * 1000000000);

        // calling the Dispatcher to send the packet
        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
    }

    /**
     * @dev Packet lifecycle callback that implements packet receipt logic and returns and acknowledgement packet.
     *      MUST be overriden by the inheriting contract.
     * 
     * @param packet the IBC packet encoded by the source and relayed by the relayer.
     */
    function onRecvPacket(IbcPacket memory packet) external override onlyIbcDispatcher returns (AckPacket memory ackPacket) {
        recvedPackets.push(packet);

        (address _caller, string memory name) = abi.decode(packet.data, (address, string));

        emit LogQuery(_caller, name);

        return AckPacket(true, abi.encode(name));
    }

    /**
     * @dev Packet lifecycle callback that implements packet acknowledgment logic.
     *      MUST be overriden by the inheriting contract.
     * 
     * @param ack the acknowledgment packet encoded by the destination and relayed by the relayer.
     */
    function onAcknowledgementPacket(IbcPacket calldata, AckPacket calldata ack) external override onlyIbcDispatcher {
        ackPackets.push(ack);
        
        (string memory name) = abi.decode(ack.data, (string));

        emit LogAcknowledgement(name);
    }

    /**
     * @dev Packet lifecycle callback that implements packet receipt logic and return and acknowledgement packet.
     *      MUST be overriden by the inheriting contract.
     *      NOT SUPPORTED YET
     * 
     * @param packet the IBC packet encoded by the counterparty and relayed by the relayer
     */
    function onTimeoutPacket(IbcPacket calldata packet) external override onlyIbcDispatcher {
        timeoutPackets.push(packet);
        // do logic
    }
}
