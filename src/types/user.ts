export type Role = 'OPERATORE' | 'SOCCORRITORE' | 'ISPETTORE';

export interface User {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
  readonly role: Role;
}

export interface Credentials {
  username: string;
  password: string;
}
