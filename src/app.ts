import express, { Express, Request, Response } from "express";
import { ethers } from "ethers";
import {
  CreateTokenClassDto,
  FetchBalancesDto,
  GrantAllowanceDto,
  MintTokenDto,
  RegisterUserDto,
  TokenInstance,
  TokenInstanceKey,
  createValidDTO,
} from "@gala-chain/api";
import {
  getAppleTreeClient,
  getPublicKeyClient,
  getTokenContractClient,
} from "./utils/ContractClient";
import { AppleTreeDto, AppleTreesDto, FetchTreesDto } from "./dto";
import { Variety } from "./types";

const app: Express = express();
const port = 3000;
const adminPrivateKey =
  "62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271";

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Backend!");
});

app.post("/pk/users", async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    const wallet = ethers.Wallet.createRandom();
    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey;
    console.log({ publicKey, privateKey });

    if (!user || user.trim() === "" || !publicKey || publicKey.trim() === "")
      return res.status(400).json({ success: false, message: "!user" });
    const input = { user, publicKey };

    const client = await getPublicKeyClient();
    const dto = await createValidDTO(RegisterUserDto, {
      user,
      publicKey,
    });
    console.log("Here Submitting Transactions");

    // CONTRACT CALL && RESPONSE
    const response = await client.submitTransaction(
      "RegisterUser",
      dto.signed(adminPrivateKey)
    );

    console.log("Here got response");
    console.log(response);

    res.json({ success: true, data: response.Data });
  } catch (error: any) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/assets/createTokenClass", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const client = await getTokenContractClient();
    console.log("Here at client");

    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Failed to initialize blockchain client.",
      });
    }
    console.log("Here at createValidDTO");
    const dto = await createValidDTO(CreateTokenClassDto, data);

    console.log("Here at signing");
    const signedDto = dto.signed(adminPrivateKey);
    console.log("Here at submitting");
    const response = await client.submitTransaction(
      "CreateTokenClass",
      signedDto
    );
    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Error Creating TokenClass user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/assets/grantAllowance", async (req: Request, res: Response) => {
  try {
    const {
      collection,
      category,
      type,
      additionalKey,
      allowanceType,
      quantities,
      uses,
    } = req.body;

    if (
      !collection ||
      !category ||
      !type ||
      !additionalKey ||
      !allowanceType ||
      !quantities ||
      !uses
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: 'collection', 'category', 'type', 'additionalKey', 'allowanceType', 'quantities', and 'uses' must all be provided.",
      });
    }

    const tokenInstanceKey = TokenInstanceKey.nftKey(
      {
        collection,
        category,
        type,
        additionalKey,
      },
      TokenInstance.FUNGIBLE_TOKEN_INSTANCE
    ).toQueryKey();

    const dtoData = {
      tokenInstance: tokenInstanceKey,
      allowanceType,
      quantities: quantities.map((q: any) => ({
        user: q.user,
        quantity: q.quantity.toString(),
      })),
      uses: uses.toString(),
    };
    const client = await getTokenContractClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Failed to initialize blockchain client.",
      });
    }

    const dto = await createValidDTO(GrantAllowanceDto, dtoData);
    const signedDto = dto.signed(adminPrivateKey);
    const response = await client.submitTransaction(
      "GrantAllowance",
      signedDto
    );
    res.json({ success: true, data: response });
  } catch (error: any) {
    //   console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/assets/mintToken", async (req: Request, res: Response) => {
  try {
    const { tokenClassKey, owner, quantity } = req.body;

    if (!tokenClassKey || !owner || quantity == null) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: 'tokenClassKey', 'owner', and 'quantity' must be provided.",
      });
    }
    const client = await getTokenContractClient();
    const dto = await createValidDTO(MintTokenDto, {
      tokenClass: tokenClassKey,
      owner,
      quantity: quantity.toString(),
    });

    const signedDto = dto.signed(adminPrivateKey);
    const response = await client.submitTransaction("MintToken", signedDto);
    res.json({ success: true, data: response });
  } catch (error: any) {
    //   console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/assets/getBalances", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query; // Assuming the user ID is passed as a query parameter
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    const client = await getTokenContractClient();
    if (!client) {
      return res.status(500).json({
        success: false,
        message: "Failed to initialize blockchain client.",
      });
    }

    // Assuming 'FetchBalances' is a smart contract function that needs a user ID
    const dto = await createValidDTO(FetchBalancesDto, {
      owner: userId as string,
    });
    const signedDto = dto.signed(adminPrivateKey);
    const balance = await client.evaluateTransaction(
      "FetchBalances",
      signedDto
    );

    res.json({ success: true, data: balance });
  } catch (error: any) {
    console.error("Error fetching balances:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/apple/plantTrees", async (req: Request, res: Response) => {
  try {
    const signedDto = new AppleTreesDto([
      new AppleTreeDto(Variety.GALA, 1),
      new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 2),
      new AppleTreeDto(Variety.GALA, 3),
    ]).signed(adminPrivateKey);

    const client = await getAppleTreeClient();
    const response = await client.submitTransaction("PlantTrees", signedDto);
    res.json({ success: true, response: response.Data });
  } catch (error: any) {
    //   console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/apple/fetchTrees", async (req: Request, res: Response) => {
  try {
    const signedDto = new FetchTreesDto(
      "client|admin",
      Variety.GOLDEN_DELICIOUS
    ).signed(adminPrivateKey);

    const client = await getAppleTreeClient();
    const response = await client.evaluateTransaction("FetchTrees", signedDto);
    res.json({ success: true, response: response.Data });
  } catch (error: any) {
    //   console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
