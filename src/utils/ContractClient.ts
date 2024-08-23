import { gcclient } from "@gala-chain/client";
import path from "path";

const NETWORK_ROOT = path.resolve(__dirname, "../../../Morphsters");
export const getPublicKeyClient = async () => {
  try {
    const params = {
      orgMsp: "CuratorOrg",
      userId: "admin",
      userSecret: "adminpw",
      apiUrl: "http://localhost:8801",
      configPath: path.resolve(NETWORK_ROOT, "api-config.json"),
    };
    const publicKeyContract = {
      channel: "product-channel",
      chaincode: "basic-product",
      contract: "PublicKeyContract",
    };
    const client = gcclient.forApiConfig(params).forContract(publicKeyContract);
    // console.log("PublicKey client initialized:", client);
    return client;
  } catch (error) {
    console.error("Error initializing PublicKey contract client:", error);
    throw error;
  }
};

export const getTokenContractClient = async () => {
  try {
    const params = {
      orgMsp: "CuratorOrg",
      userId: "admin",
      userSecret: "adminpw",
      apiUrl: "http://localhost:8801",
      configPath: path.resolve(NETWORK_ROOT, "api-config.json"),
    };
    const galaChainTokenContract = {
      channel: "product-channel",
      chaincode: "basic-product",
      contract: "MorphstersToken",
    };
    const client = gcclient
      .forApiConfig(params)
      .forContract(galaChainTokenContract);
    console.log("PublicKey client initialized:", client.extendAPI);
    return client;
  } catch (error) {
    console.error("Error initializing PublicKey contract client:", error);
    throw error;
  }
};

export const getAppleTreeClient = async () => {
  try {
    const params = {
      orgMsp: "CuratorOrg",
      userId: "admin",
      userSecret: "adminpw",
      apiUrl: "http://localhost:8801",
      configPath: path.resolve(NETWORK_ROOT, "api-config.json"),
    };
    const appleContractContract = {
      channel: "product-channel",
      chaincode: "basic-product",
      contract: "AppleContract",
    };
    const client = gcclient
      .forApiConfig(params)
      .forContract(appleContractContract);
    // console.log("PublicKey client initialized:", client);
    return client;
  } catch (error) {
    console.error("Error initializing PublicKey contract client:", error);
    throw error;
  }
};
