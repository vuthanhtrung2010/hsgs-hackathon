export interface IUsersListData {
  id: number;
  name: string;
  shortName: string;
  rating: number;
}

export interface Recommendations {
  id: number;
  title: string;
  rating: number;
}

export interface Clusters {
  BUSINESS: number;
  ENVIRONMENT: number;
  FAMILY_AND_CHILDREN: number;
  FOOD: number;
  TECHNOLOGY: number;
  TRANSPORT: number;
  CRIME: number;
  LANGUAGE: number;
  TRAVEL: number;
  ECONOMY: number;
  HEALTH: number;
  EDUCATION: number;
  COMMUNICATION: number;
  MEDIA: number;
  READING: number;
  ART: number;
}

export interface IUserData {
  id: number;
  name: string;
  shortName: string;
  rating: number;
  minRating: number;
  maxRating: number;
  ratingChanges: {
    date: string;
    rating: number;
  }[];
  avatarURL: string;
  recommendations?: Recommendations[];
  clusters: Clusters;
}

export async function getUsersList(): Promise<IUsersListData[]> {
  try {
    const url = new URL("/api/users/list", process.env.API_BASE_URL);
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-cache",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.users as IUsersListData[];
  } catch (error) {
    console.error("Error fetching users list:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

export async function getUserData(userId: number): Promise<IUserData> {
  try {
    const url = new URL(
      `/api/users/details/${userId}`,
      process.env.API_BASE_URL
    );
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-cache",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    const avatarURL = new URL(
      `/api/v1/users/${userId}/avatars`,
      process.env.CANVAS_API_BASE_URL
    );
    const avatarResponse = await fetch(avatarURL.toString(), {
      method: "GET",
      cache: "no-cache",
      next: { revalidate: 60 }, // Revalidate every 60 seconds
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CANVAS_API_KEY}`,
      },
    });

    if (!avatarResponse.ok) {
      throw new Error(
        `Failed to fetch user avatar: ${avatarResponse.statusText}`
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const data = await response.json();
    const avatarData = await avatarResponse.json();

    // Merge data and avatarData
    const mergedData = {
      ...data,
      avatarURL: avatarData[0].url,
    };

    return mergedData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Re-throw to handle in the calling function
  }
}
