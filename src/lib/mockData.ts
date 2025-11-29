import { DesignCollection, DesignMarking, DesignVote, FinalSelection, MarkingWithVotes } from '@/types';

// Keys for localStorage
const STORAGE_KEYS = {
    COLLECTIONS: 'mock_collections',
    MARKINGS: 'mock_markings',
    VOTES: 'mock_votes',
    SELECTIONS: 'mock_selections'
};

// Initial mock data
const INITIAL_COLLECTIONS: DesignCollection[] = [
    {
        id: '1',
        created_at: new Date().toISOString(),
        uploaded_by: 'admin',
        title: 'Spring Collection 2024',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop', // Placeholder image
        status: 'active'
    },
    {
        id: '2',
        created_at: new Date().toISOString(),
        uploaded_by: 'admin',
        title: 'Summer Vibes',
        image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1974&auto=format&fit=crop',
        status: 'active'
    }
];

// Helper to get data
const get = <T>(key: string, initial: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(stored);
};

// Helper to set data
const set = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
    getCollections: (): DesignCollection[] => get(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS),

    addCollection: (collection: DesignCollection) => {
        const current = get<DesignCollection[]>(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
        set(STORAGE_KEYS.COLLECTIONS, [collection, ...current]);
    },

    getMarkings: (collectionId: string): DesignMarking[] => {
        const all = get<DesignMarking[]>(STORAGE_KEYS.MARKINGS, []);
        return all.filter(m => m.collection_id === collectionId);
    },

    addMarking: (marking: DesignMarking) => {
        const all = get<DesignMarking[]>(STORAGE_KEYS.MARKINGS, []);
        set(STORAGE_KEYS.MARKINGS, [...all, marking]);
    },

    deleteMarking: (id: string) => {
        const all = get<DesignMarking[]>(STORAGE_KEYS.MARKINGS, []);
        set(STORAGE_KEYS.MARKINGS, all.filter(m => m.id !== id));
    },

    getVotes: (markingId: string): DesignVote[] => {
        const all = get<DesignVote[]>(STORAGE_KEYS.VOTES, []);
        return all.filter(v => v.marking_id === markingId);
    },

    addVote: (vote: DesignVote) => {
        const all = get<DesignVote[]>(STORAGE_KEYS.VOTES, []);
        set(STORAGE_KEYS.VOTES, [...all, vote]);
    },

    removeVote: (markingId: string, designerId: string) => {
        const all = get<DesignVote[]>(STORAGE_KEYS.VOTES, []);
        set(STORAGE_KEYS.VOTES, all.filter(v => !(v.marking_id === markingId && v.designer_id === designerId)));
    },

    getSelections: (collectionId: string): FinalSelection[] => {
        const all = get<FinalSelection[]>(STORAGE_KEYS.SELECTIONS, []);
        return all.filter(s => s.collection_id === collectionId);
    },

    addSelection: (selection: FinalSelection) => {
        const all = get<FinalSelection[]>(STORAGE_KEYS.SELECTIONS, []);
        set(STORAGE_KEYS.SELECTIONS, [...all, selection]);
    },

    removeSelection: (id: string) => {
        const all = get<FinalSelection[]>(STORAGE_KEYS.SELECTIONS, []);
        set(STORAGE_KEYS.SELECTIONS, all.filter(s => s.id !== id));
    },

    // Helper to get markings with vote counts (simulating the join)
    getMarkingsWithVotes: (collectionId: string, currentUserId: string): MarkingWithVotes[] => {
        const markings = mockDb.getMarkings(collectionId);
        const allVotes = get<DesignVote[]>(STORAGE_KEYS.VOTES, []);

        return markings.map(m => {
            const votes = allVotes.filter(v => v.marking_id === m.id);
            return {
                ...m,
                vote_count: votes.length,
                voters: votes.map(v => v.designer_id),
                has_user_voted: votes.some(v => v.designer_id === currentUserId)
            };
        });
    }
};
