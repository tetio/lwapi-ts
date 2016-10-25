// Create an interface
export interface DataEntry {
  // Define an optional property by appending '?' to the name
  id?: number;
}

// Declare a new type
export type Role = 'admin' | 'user';

// Extend an interface
export interface User extends DataEntry {
  username: string;
  name: string;
  role: Role;
}

export interface Gif extends DataEntry {
  title: string;
  url: string;
}

// Create a generic class.
// Declare that generic type needs to extend a certain  interface
export class MockDB<TData extends DataEntry> {
  // Declare a private property
  private data: TData[];
  
  constructor(defaultData: TData[] = []) {
    this.data = defaultData;
  }

  // Define union types for functions with multiple return data
  public get(id?: number): TData | TData[] {
    // Do native type checking for run-time type checks
    if (typeof id === 'number') {
      return this.data[id];
    }

    return this.data.map((user, idx) => {
      user.id = idx
      return user;
    });
  }

  // Function overloading by redefining the function
  public update(user: User): number;
  public update(id: number, user: User): number;
  public update(idOrUser: number | User, user?: User): number {
    // Use native type checking to determine which process should be taken
    if (typeof idOrUser === 'number') {
      this.data[idOrUser] = this.clone(user);
      return idOrUser;
    } else {
      this.data.push(this.clone(idOrUser));
      return this.data.length - 1;
    }
  }

  public remove(id: number) {
    this.data.splice(id, 1);
    return {};
  }

  private clone(obj: Object) {
    return JSON.parse(JSON.stringify(obj));
  }
}

export const MOCK_USERS: User[] = [
  {
    username: 'richard',
    name: 'Richard Hendricks',
    role: 'admin'
  },
  {
    username: 'erlich',
    name: 'Erlich Bachman',
    role: 'admin'
  }
];