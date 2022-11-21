import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import Web3Modal from 'web3modal';
import { BigNumber, Contract, utils, providers } from 'ethers';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '../constants';

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 80001) {
      window.alert('Change the network to polygon Testnet');
      throw new Error('change the network to polygon Testnet');
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer.getNetwork();
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        provider
      );
      const signer = getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfCryptoDevTokens(zero);
    }
  };
  const getTotalTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        provider
      );
      const _tokenMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokenMinted);
    } catch (err) {
      console.error(err, 'he');
    }
  };

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        signer
      );

      const value = 0.001 * amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert('Successfully minted Crypto Dev Token');
      await getBalanceOfCryptoDevTokens();
      await getTotalTokenMinted();
    } catch (err) {
      console.error(err);
    }
  };
  const renderButton = () => {
    if (loading) {
      return <div className={styles.button}>Loading...</div>;
    }
    return (
      <div style={{ display: 'flex-col' }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>
        <button
          className={styles.button}
          disabled={!tokenAmount}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'polygon',
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      getBalanceOfCryptoDevTokens();
      getTotalTokenMinted();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Token-minting-dAPP</title>
        <meta name="description" content="Token-Minting-dAPP" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Token minting Dapp</h1>
          <div className={styles.description}>
            Here you can claim ot mint Crypto Dev tokens.
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                you have minted {utils.formatEther(balanceOfCryptoDevTokens)} of
                tokens
              </div>
              <div className={styles.description}>
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
