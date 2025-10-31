import * as Appwrite from "appwrite";

const { Client, Databases, ID, Query } = Appwrite;

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Create a Databases instance (tables live here)
const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // List rows (documents)
        const result = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TABLE_ID,
            [Query.equal("searchTerm", searchTerm)]
        );

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_TABLE_ID,
                doc.$id,
                { count: doc.count + 1 }
            );
        } else {
            await databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_TABLE_ID,
                ID.unique(),
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                }
            );
        }
    } catch (error) {
        console.error("updateSearchCount error:", error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_TABLE_ID,
            [Query.limit(5), Query.orderDesc("count")]
        );
        return result.documents;
    } catch (error) {
        console.error("getTrendingMovies error:", error);
        return [];
    }
};
