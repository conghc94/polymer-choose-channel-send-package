import './App.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import { useAccount, useChainId, useChains, useReadContract, useWriteContract } from 'wagmi';
import axios from 'axios';
import _ from 'lodash';

import StudentInfo from './abi/StudentInfo.json';

const AddressContractStudentInfo = {
  optimisim: "0xaEC739d4Ae2630ab9300681163b537d94156Fb2f",
  base: "0x9c5114AD5467850d9474142E52D180B4E06cA9B5"
};

function App() {
  const wallet = useAccount();
  const { hash , error, isPending, writeContract } = useWriteContract();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  // const [connectedChannelsBefore, setconnectedChannelsBefore] = useState([]);
  // const [connectedChannelsAfter, setConnectedChannelsAfter] = useState([]);
  const chains = useChains();
  const chainId = useChainId();

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleChangeAge = (e) => {
    setAge(e.target.value);
  };

  useEffect(() => {
    const getListChannel = async () => {
      try {
        // const response = await axios.get('http://localhost:3001/get-list-channel');
        const response = {
          data: ['channel-39334', 'channel-39338', 'channel-40046', 'channel-40052']
        }
        setChannels(response.data);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      }
    };

    getListChannel();
  }, []);

  const sendPacket = async (channel) => {
    if(name === '' || age === '') {
      alert('Please fill in all fields');
      return;
    }
    const student = {
      name,
      age
    }

    console.log('student', student);

    writeContract({
      address: AddressContractStudentInfo.optimisim,
      abi: StudentInfo,
      functionName: 'addOrUpdateStudent',
      args: [
        student.name,
        Number(student.age)
      ]
    });

    console.log("error", error);

    // const response = await axios.post('http://localhost:3001/send-packet', { channel, student });
    // console.log('response', response);
  };

  // const currentChain = _.find(chains, { id: chainId });
  // console.log('currentChain', currentChain);
  // if (!currentChain) {
  //   alert('Please connect to a OP or BASE testnet chain.');
  //   return;
  // }
  // console.log('wallet?.address', wallet?.address);
  const connectedChannel = useReadContract({
    address: AddressContractStudentInfo.optimisim,
    abi: StudentInfo,
    functionName: 'getConnectedChannels',
    args: []
  });

  console.log('connectedChannel', connectedChannel);

  if (connectedChannel.isSuccess) {
    // console.log('connectedChannel', ethers.decodeBytes32String(connectedChannel.queryKey[1].channelId));
    console.log('chainId', chainId);
    console.log('connectedChannel', connectedChannel.queryKey[1].chainId.toString());
    console.log('connectedChannel', ethers.encodeBytes32String(connectedChannel.queryKey[1].chainId.toString()));
  }

  const getStudentInfo = useReadContract({
    address: AddressContractStudentInfo.optimisim,
    abi: StudentInfo,
    functionName: 'getStudentInfo',
    args: [wallet?.address]
  });

  if (getStudentInfo.isSuccess) {
    console.log('getStudentInfo', getStudentInfo);
  }

  const createChannel = async () => {
    const createDummyProof = () => {
      return {
        proof: [
          {
            path: [
              {
                prefix: ethers.toUtf8Bytes("prefixExample1"),
                suffix: ethers.toUtf8Bytes("suffixExample1"),
              },
              // Add more OpIcs23ProofPath objects as needed
            ],
            key: ethers.toUtf8Bytes("keyExample"),
            value: ethers.toUtf8Bytes("valueExample"),
            prefix: ethers.toUtf8Bytes("prefixExample")
          },
          // Add more OpIcs23Proof objects as needed
        ],
        height: 123456, // example block height
      };
    };

    try {
      const local = {
        portId: AddressContractStudentInfo.optimisim,
        channelId: ethers.encodeBytes32String(''),
        version: '1.0',
      };

      const cp = {
        portId: AddressContractStudentInfo.base,
        channelId: ethers.encodeBytes32String(''),
        version: '',
      };

      writeContract({
        address: AddressContractStudentInfo.optimisim,
        abi: StudentInfo,
        functionName: 'createChannel',
        args: [
          local,
          ethers.formatEther(0),
          false,
          ['connection-0', 'connection-5'],
          cp,
          createDummyProof()
        ]
      });
      console.log("error", error);
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setTimeout(async () => {
        // Call get connected channel
      }, 90000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 20,
          marginRight: 100
        }}
      >
        <ConnectButton />
      </div>

      <div className='flex flex-col py-0 mx-auto px-4 items-center justify-center'>
        <div className='font-bold px-[200px]'>Student Infomation</div>
        <div className='ml-5' style={{ width: 480 }}>
          <div className='mt-5'>
            <label>
              Name:
              <input name="name" value={name} onChange={handleChangeName} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="name" />
            </label>
          </div>
          <div className='mt-3'>
            <label>
              Age:
              <input name="age" value={age} onChange={handleChangeAge} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="age" />
            </label>
          </div>
        </div>
      </div>

      <div className='flex flex-col py-0 mx-auto px-4 items-center justify-center mt-10'>
        {hash ? `<div>hash: ${hash}</div>` : ''}
        <div className='font-bold p-4 m-1 flex justify-between items-center' style={{ width: 500 }}>
          <div style={{ fontSize: 15 }}>Choose Channel Send Packet</div>
          <button onClick={createChannel} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded ml-20">Create channel</button>
        </div>
        {channels.map((channel, index) => (
          <div key={index} className="ml-5 flex items-center justify-between border p-4 m-1 bg-white cursor-pointer hover:bg-cyan-200" style={{ width: '500px' }}>
            <p>{channel}</p>
            <button onClick={() => sendPacket(channel)} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              Send Packet
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
