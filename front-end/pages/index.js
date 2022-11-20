import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import Web3Modal, { providers } from 'web3modal';
import { BigNumber, utils } from 'ethers';

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.web3Provider(provider);

    const { chainId } = web3Provider.getNetwork();

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

  const renderButton = () => {
    return (
      <div style={{ display: 'flex-col' }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button className={styles.button} disabled={!tokenAmount}>
            Mint Tokens
          </button>
        </div>
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
    }
  }, []);

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
              {renderButton}
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
