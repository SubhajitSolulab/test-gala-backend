import { ChainCallDTO, StringEnumProperty } from "@gala-chain/api";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import { AppleTree } from "./AppleTree";
import { Variety } from "./types";

export class AppleTreeDto extends ChainCallDTO {
  @StringEnumProperty(Variety)
  public readonly variety: Variety;

  public readonly index: number;

  constructor(variety: Variety, index: number) {
    super();
    this.variety = variety;
    this.index = index;
  }
}

export class AppleTreesDto extends ChainCallDTO {
  @ValidateNested({ each: true })
  @Type(() => AppleTreeDto)
  @ArrayNotEmpty()
  public readonly trees: AppleTreeDto[];

  constructor(trees: AppleTreeDto[]) {
    super();
    this.trees = trees;
  }
}

export class PickAppleDto extends ChainCallDTO {
  @IsString()
  public readonly PlantedBy: string;

  @StringEnumProperty(Variety)
  public readonly variety: Variety;

  public readonly index: number;

  constructor(treePlantedBy: string, variety: Variety, index: number) {
    super();
    this.PlantedBy = treePlantedBy;
    this.variety = variety;
    this.index = index;
  }
}

export class FetchTreesDto extends ChainCallDTO {
  @IsString()
  @ValidateIf((o) => o.plantedBy !== undefined || o.variety !== undefined)
  public readonly plantedBy?: string;

  @IsIn(Object.keys(Variety))
  @ValidateIf((o) => o.variety !== undefined || o.index !== undefined)
  public readonly variety?: Variety;

  @IsOptional()
  public readonly index?: number;

  @IsString()
  @IsOptional()
  public readonly bookmark?: string;

  @IsOptional()
  public readonly limit?: number;

  constructor(
    plantedBy?: string,
    variety?: Variety,
    index?: number,
    bookmark?: string,
    limit?: number
  ) {
    super();
    this.plantedBy = plantedBy;
    this.variety = variety;
    this.index = index;
    this.bookmark = bookmark;
    this.limit = limit;
  }
}

export class PagedTreesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppleTree)
  public readonly trees: AppleTree[];

  @IsString()
  public readonly bookmark: string;

  constructor(trees: AppleTree[], bookmark: string) {
    this.trees = trees;
    this.bookmark = bookmark;
  }
}
