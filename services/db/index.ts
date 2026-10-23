import { db } from '@/services/bootstrap/databaseBootstrap';
export { db };
export { useDatabaseBootstrap as useDatabase } from '@/services/bootstrap/databaseBootstrap';

// Export the database instance for direct use
export default db;
