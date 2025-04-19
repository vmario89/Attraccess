import { Logger } from '@nestjs/common';

export type SemanticVersionString = `${number}.${number}.${number}`;
export type SemanticVersionArray = [number, number, number];
export type SemanticVersionObject = {
  major: number;
  minor: number;
  patch: number;
};
export type SemanticVersionLike = SemanticVersionObject | SemanticVersionString | SemanticVersionArray | string;

export class SemanticVersion implements SemanticVersionObject {
  private static readonly logger = new Logger(SemanticVersion.name);

  public readonly major: number;
  public readonly minor: number;
  public readonly patch: number;

  constructor(version: SemanticVersionObject) {
    if (typeof version.major !== 'number' || typeof version.minor !== 'number' || typeof version.patch !== 'number') {
      throw new Error('Invalid version object');
    }
    SemanticVersion.logger.debug(`Creating new SemanticVersion from object:`, version);

    this.major = version.major;
    this.minor = version.minor;
    this.patch = version.patch;
  }

  public static fromString(version: string): SemanticVersion {
    SemanticVersion.logger.debug(`Creating SemanticVersion from string: "${version}"`);
    const parts = version.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid version string');
    }

    SemanticVersion.logger.debug(`Parts:`, parts);

    const partsAsNumbers = parts.map(Number);
    if (partsAsNumbers.some((part) => isNaN(part))) {
      throw new Error('Invalid version string');
    }

    SemanticVersion.logger.debug(`Parts as numbers:`, partsAsNumbers);

    const [major, minor, patch] = partsAsNumbers;
    return new SemanticVersion({ major, minor, patch });
  }

  public static fromArray(version: SemanticVersionArray): SemanticVersion {
    SemanticVersion.logger.debug(`Creating SemanticVersion from array:`, version);
    return new SemanticVersion({
      major: version[0],
      minor: version[1],
      patch: version[2],
    });
  }

  public static fromSemanticVersionLike(version: SemanticVersionLike): SemanticVersion {
    if (typeof version === 'string') {
      SemanticVersion.logger.debug(`Converting SemanticVersionLike (string): "${version}"`);
      return SemanticVersion.fromString(version);
    } else if (Array.isArray(version)) {
      SemanticVersion.logger.debug(`Converting SemanticVersionLike (array):`, version);
      return SemanticVersion.fromArray(version);
    } else {
      SemanticVersion.logger.debug(`Converting SemanticVersionLike (object):`, version);
      return new SemanticVersion(version);
    }
  }

  public toString(): SemanticVersionString {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  public toArray(): SemanticVersionArray {
    return [this.major, this.minor, this.patch];
  }

  public equals(other: SemanticVersionLike): boolean {
    const otherVersion = SemanticVersion.fromSemanticVersionLike(other);
    const result = this.toString() === otherVersion.toString();
    SemanticVersion.logger.debug(`Comparing equality: ${this.toString()} === ${otherVersion.toString()} -> ${result}`);
    return result;
  }

  public isGreaterThan(other: SemanticVersionLike): boolean {
    const otherVersion = SemanticVersion.fromSemanticVersionLike(other);
    let result = false;

    if (this.major > otherVersion.major) {
      result = true;
    }

    if (this.major === otherVersion.major && this.minor > otherVersion.minor) {
      result = true;
    }

    if (this.major === otherVersion.major && this.minor === otherVersion.minor && this.patch > otherVersion.patch) {
      result = true;
    }
    SemanticVersion.logger.debug(
      `Comparing greater than: ${this.toString()} > ${otherVersion.toString()} -> ${result}`
    );

    return result;
  }

  public isLessThan(other: SemanticVersionLike): boolean {
    const otherVersion = SemanticVersion.fromSemanticVersionLike(other);
    const result = this.toString() < otherVersion.toString();
    SemanticVersion.logger.debug(`Comparing less than: ${this.toString()} < ${otherVersion.toString()} -> ${result}`);
    return result;
  }

  public isGreaterThanOrEqualTo(other: SemanticVersionLike): boolean {
    const otherVersion = SemanticVersion.fromSemanticVersionLike(other);
    const result = this.isGreaterThan(otherVersion) || this.equals(otherVersion);
    SemanticVersion.logger.debug(
      `Comparing greater than or equal: ${this.toString()} >= ${otherVersion.toString()} -> ${result}`
    );
    return result;
  }

  public isLessThanOrEqualTo(other: SemanticVersionLike): boolean {
    const otherVersion = SemanticVersion.fromSemanticVersionLike(other);
    const result = this.isLessThan(otherVersion) || this.equals(otherVersion);
    SemanticVersion.logger.debug(
      `Comparing less than or equal: ${this.toString()} <= ${otherVersion.toString()} -> ${result}`
    );
    return result;
  }
}
