export interface IUsersListData {
    id: number;
    name: string;
    shortName: string;
    rating: number;
}

export async function getUsersList(): Promise<IUsersListData[]> {
    try {
        const response = await fetch("/api/users/list", {
            method: "GET",
            cache: "no-cache",
            next: { revalidate: 60 } // Revalidate every 60 seconds
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