import faker from "faker";

import {
  Mission,
  PendingUser,
  PendingUsers,
  TotalUserPieces,
  User
} from "../models";

export class MissionBuilder {
  model: Partial<Mission> = {};

  constructor(partialMission: Partial<Mission> = {}) {
    this.model = partialMission;
  }

  withValidValues() {
    const ownerId = faker.random.word() as string;
    const totalPieces = faker.random.number() as number;

    this.name(faker.company.companyName());
    this.ownerUserId(ownerId);
    this.description("fake description");
    this.isPrivate(false);
    this.startTime(1);
    this.endTime(2);
    this.targetPieces(faker.random.number());
    this.totalPieces(totalPieces);
    this.totalUserPieces({
      [ownerId]: {
        uid: ownerId,
        displayName: faker.name.firstName(),
        pieces: totalPieces
      }
    });
    this.pendingPieces(faker.random.number());
    this.pendingUsers([]);

    return this;
  }

  withConfigurableValues() {
    this.name(faker.company.companyName());
    this.description("fake description");
    this.isPrivate(false);
    this.startTime(1);
    this.endTime(2);
    this.targetPieces(faker.random.number());
    this.pendingPieces(faker.random.number());

    return this;
  }

  build() {
    return this.model;
  }

  name(name: string) {
    this.model.name = name;
    return this;
  }

  ownerUserId(ownerUserId: string) {
    this.model.ownerUserId = ownerUserId;
    return this;
  }

  description(description: string) {
    this.model.description = description;
    return this;
  }

  isPrivate(isPrivate: boolean) {
    this.model.isPrivate = isPrivate;
    return this;
  }

  startTime(startTime: number) {
    this.model.startTime = startTime;
    return this;
  }

  endTime(endTime: number) {
    this.model.endTime = endTime;
    return this;
  }

  targetPieces(targetPieces: number) {
    this.model.targetPieces = targetPieces;
    return this;
  }

  totalPieces(totalPieces: number) {
    this.model.totalPieces = totalPieces;
    return this;
  }

  totalUserPieces(totalUserPieces: TotalUserPieces) {
    this.model.totalUserPieces = totalUserPieces;
    return this;
  }

  pendingPieces(pendingPieces: number) {
    this.model.pendingPieces = pendingPieces;
    return this;
  }

  pendingUsers(pendingUsers: PendingUsers) {
    this.model.pendingUsers = pendingUsers;
    return this;
  }

  addUser(user: User) {
    this.model.totalUserPieces = {
      ...this.model.totalUserPieces,
      [user.uid]: user
    };

    return this;
  }

  addPendingUser(pendingUser: PendingUser) {
    this.model.pendingUsers = [...(this.model.pendingUsers || []), pendingUser];

    return this;
  }
}
