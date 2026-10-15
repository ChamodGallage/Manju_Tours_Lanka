import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  OrderByDirection,
  Query,
  QuerySnapshot,
  WhereFilterOp,
} from "firebase-admin/firestore";

type QueryConstraint =
  | { type: "where"; field: string; operator: WhereFilterOp; value: unknown }
  | { type: "orderBy"; field: string; direction?: OrderByDirection };

export function collection(db: Firestore, name: string) {
  return db.collection(name);
}

export function doc(db: Firestore, collectionName: string, documentId: string): DocumentReference {
  return db.collection(collectionName).doc(documentId);
}

export async function getDoc(reference: DocumentReference) {
  const snapshot: DocumentSnapshot = await reference.get();
  return {
    id: snapshot.id,
    exists: () => snapshot.exists,
    data: () => snapshot.data(),
  };
}

export async function getDocs(queryRef: Query): Promise<QuerySnapshot> {
  return queryRef.get();
}

export async function setDoc(
  reference: DocumentReference,
  data: DocumentData,
  options?: { merge?: boolean }
): Promise<void> {
  if (options) {
    await reference.set(data, options);
    return;
  }
  await reference.set(data);
}

export async function deleteDoc(reference: DocumentReference): Promise<void> {
  await reference.delete();
}

export function where(field: string, operator: WhereFilterOp, value: unknown): QueryConstraint {
  return { type: "where", field, operator, value };
}

export function orderBy(field: string, direction?: OrderByDirection): QueryConstraint {
  return { type: "orderBy", field, direction };
}

export function query(base: Query, ...constraints: QueryConstraint[]): Query {
  return constraints.reduce((current, constraint) => {
    if (constraint.type === "where") {
      return current.where(constraint.field, constraint.operator, constraint.value);
    }
    return current.orderBy(constraint.field, constraint.direction);
  }, base);
}
