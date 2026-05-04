// ── Operon BrewOS — Typed Supabase Client & Query Helpers ──
// All helpers use the authenticated client so RLS applies automatically.
// No application-level brewery_id filter is required — the DB enforces isolation.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type {
  BreweryProfile,
  Ingredient,
  PackagingFormat,
  Recipe,
  Batch,
  BrewLog,
  Lot,
  Sale,
  Declaration,
  InventoryMovement,
  PendingMovement,
  EventLog,
} from "@/types/domain";

// ── Database row types (from generated Supabase types) ──

import type { Database } from "@/types/supabase";

type DbBreweryProfile = Database["public"]["Tables"]["brewery_profiles"]["Row"];
type DbIngredient = Database["public"]["Tables"]["ingredients"]["Row"];
type DbPackagingFormat = Database["public"]["Tables"]["packaging_formats"]["Row"];
type DbRecipe = Database["public"]["Tables"]["recipes"]["Row"];
type DbBatch = Database["public"]["Tables"]["batches"]["Row"];
type DbBrewLog = Database["public"]["Tables"]["brew_logs"]["Row"];
type DbLot = Database["public"]["Tables"]["lots"]["Row"];
type DbSale = Database["public"]["Tables"]["sales"]["Row"];
type DbDeclaration = Database["public"]["Tables"]["declarations"]["Row"];
type DbInventoryMovement = Database["public"]["Tables"]["inventory_movements"]["Row"];
type DbPendingMovement = Database["public"]["Tables"]["pending_movements"]["Row"];
type DbEventLog = Database["public"]["Tables"]["event_logs"]["Row"];

// ── Type mappers (DB row → domain type) ──

function mapBreweryProfile(r: DbBreweryProfile): BreweryProfile {
  return {
    id: r.id,
    slug: r.id,
    name: r.display_name ?? r.name,
    country: r.country ?? "",
    locale: r.language,
    currency: r.currency,
    timezone: r.timezone,
    annualProductionLimitL: null,
    exciseRegistrationNumber: r.excise_authorization_number,
    isActive: r.onboarding_status !== "deactivated",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapIngredient(r: DbIngredient): Ingredient {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    name: r.name,
    category: (r.category as Ingredient["category"]) ?? "other",
    ingredientType: (r.ingredient_type as Ingredient["ingredientType"]) ?? "other",
    unit: r.default_unit ?? "kg",
    currentStockKg: null,
    notes: null,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPackagingFormat(r: DbPackagingFormat): PackagingFormat {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    name: r.name,
    volumeL: r.size_liters,
    containerType: r.container_type,
    isActive: r.is_active,
  };
}

function mapRecipe(r: DbRecipe): Recipe {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    name: r.name,
    style: null,
    targetOg: r.target_og,
    targetFg: r.target_fg,
    targetAbvPct: null,
    targetIbu: null,
    targetColorEbc: null,
    mashTempC: null,
    boilDurationMin: r.default_boil_duration_min,
    preboilVolumeL: r.target_pre_boil_volume_liters,
    postboilVolumeL: r.target_post_boil_volume_liters,
    notes: r.notes,
    isArchived: !r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapBatch(r: DbBatch): Batch {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    recipeId: r.recipe_id,
    batchNumber: r.batch_number,
    declarationNumber: r.declaration_number,
    displayName: r.batch_number,
    status: r.status as Batch["status"],
    brewDate: r.brew_date,
    packageDate: null,
    volumeBrewedL: r.actual_volume_liters,
    volumePackagedL: null,
    actualOg: null,
    actualFg: null,
    actualAbvPct: null,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapBrewLog(r: DbBrewLog): BrewLog {
  return {
    id: r.id,
    batchId: r.batch_id,
    loggedAt: r.created_at,
    stage: r.log_status,
    value: r.actual_fermenter_volume_liters,
    unit: "L",
    notes: r.brewer_notes,
  };
}

function mapLot(r: DbLot): Lot {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    batchId: r.batch_id,
    lotType: r.lot_type as Lot["lotType"],
    status: r.status as Lot["status"],
    volumeL: r.volume_liters ?? 0,
    packagingState: r.packaging_state as Lot["packagingState"],
    exciseState: r.excise_state as Lot["exciseState"],
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapSale(r: DbSale): Sale {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    lotId: r.lot_id,
    saleDate: r.sale_date ?? r.created_at,
    volumeL: r.volume_sold ?? 0,
    pricePerL: r.amount && r.volume_sold ? r.amount / r.volume_sold : null,
    buyerName: r.customer,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

function mapDeclaration(r: DbDeclaration): Declaration {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    batchId: null,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    volumeL: 0,
    exciseState: r.status === "submitted" ? "submitted" : r.status === "accepted" ? "cleared" : "pending",
    submittedAt: r.submission_date,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

function mapInventoryMovement(r: DbInventoryMovement): InventoryMovement {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    ingredientId: r.ingredient_id,
    lotId: r.lot_id,
    direction: r.direction as InventoryMovement["direction"],
    quantityKg: r.base_quantity_kg,
    volumeL: r.base_quantity_liters,
    movedAt: r.movement_timestamp,
    reason: r.reason,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

function mapPendingMovement(r: DbPendingMovement): PendingMovement {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    ingredientId: r.ingredient_id,
    lotId: r.lot_id,
    direction: (r.direction as PendingMovement["direction"]) ?? "out",
    quantityKg: null,
    volumeL: r.quantity,
    scheduledFor: null,
    resolvedAt: null,
    resolutionStatus: r.resolution_status as PendingMovement["resolutionStatus"],
    notes: r.completion_notes,
    createdAt: r.created_at,
  };
}

function mapEventLog(r: DbEventLog): EventLog {
  return {
    id: r.id,
    breweryId: r.brewery_id,
    userId: r.actor_user_id,
    category: (r.object_type as EventLog["category"]) ?? "system",
    entityType: r.object_type,
    entityId: r.object_id,
    action: r.event_type,
    payload: r.payload_json,
    createdAt: r.created_at,
  };
}

// ── Client factory ──

export const dbClient: SupabaseClient = supabase;

// Helper: throw on Supabase error
function assertOk<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(`[db] ${error.message}`);
  if (data === null) throw new Error("[db] No data returned");
  return data;
}

// ── Brewery ──

export async function getBrewery(id: string): Promise<BreweryProfile> {
  const { data, error } = await dbClient
    .from("brewery_profiles")
    .select("*")
    .eq("id", id)
    .single();
  return mapBreweryProfile(assertOk(data, error));
}

export async function updateBrewery(id: string, patch: Partial<DbBreweryProfile>): Promise<BreweryProfile> {
  const { data, error } = await dbClient
    .from("brewery_profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapBreweryProfile(assertOk(data, error));
}

// ── Ingredients ──

export async function getIngredients(breweryId: string): Promise<Ingredient[]> {
  const { data, error } = await dbClient
    .from("ingredients")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("name");
  return assertOk(data, error).map(mapIngredient);
}

export async function getIngredient(id: string): Promise<Ingredient> {
  const { data, error } = await dbClient
    .from("ingredients")
    .select("*")
    .eq("id", id)
    .single();
  return mapIngredient(assertOk(data, error));
}

export async function createIngredient(payload: Omit<DbIngredient, "id" | "created_at" | "updated_at">): Promise<Ingredient> {
  const { data, error } = await dbClient
    .from("ingredients")
    .insert(payload)
    .select()
    .single();
  return mapIngredient(assertOk(data, error));
}

export async function updateIngredient(id: string, patch: Partial<DbIngredient>): Promise<Ingredient> {
  const { data, error } = await dbClient
    .from("ingredients")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapIngredient(assertOk(data, error));
}

// ── Packaging Formats ──

export async function getPackagingFormats(breweryId: string): Promise<PackagingFormat[]> {
  const { data, error } = await dbClient
    .from("packaging_formats")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("name");
  return assertOk(data, error).map(mapPackagingFormat);
}

export async function getPackagingFormat(id: string): Promise<PackagingFormat> {
  const { data, error } = await dbClient
    .from("packaging_formats")
    .select("*")
    .eq("id", id)
    .single();
  return mapPackagingFormat(assertOk(data, error));
}

export async function createPackagingFormat(payload: Omit<DbPackagingFormat, "id" | "created_at" | "updated_at">): Promise<PackagingFormat> {
  const { data, error } = await dbClient
    .from("packaging_formats")
    .insert(payload)
    .select()
    .single();
  return mapPackagingFormat(assertOk(data, error));
}

export async function updatePackagingFormat(id: string, patch: Partial<DbPackagingFormat>): Promise<PackagingFormat> {
  const { data, error } = await dbClient
    .from("packaging_formats")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapPackagingFormat(assertOk(data, error));
}

// ── Recipes ──

export async function getRecipes(breweryId: string): Promise<Recipe[]> {
  const { data, error } = await dbClient
    .from("recipes")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("name");
  return assertOk(data, error).map(mapRecipe);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data, error } = await dbClient
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();
  return mapRecipe(assertOk(data, error));
}

export async function createRecipe(payload: Omit<DbRecipe, "id" | "created_at" | "updated_at">): Promise<Recipe> {
  const { data, error } = await dbClient
    .from("recipes")
    .insert(payload)
    .select()
    .single();
  return mapRecipe(assertOk(data, error));
}

export async function updateRecipe(id: string, patch: Partial<DbRecipe>): Promise<Recipe> {
  const { data, error } = await dbClient
    .from("recipes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapRecipe(assertOk(data, error));
}

// ── Batches ──

export async function getBatches(breweryId: string): Promise<Batch[]> {
  const { data, error } = await dbClient
    .from("batches")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("created_at", { ascending: false });
  return assertOk(data, error).map(mapBatch);
}

export async function getBatch(id: string): Promise<Batch> {
  const { data, error } = await dbClient
    .from("batches")
    .select("*")
    .eq("id", id)
    .single();
  return mapBatch(assertOk(data, error));
}

export async function createBatch(payload: Omit<DbBatch, "id" | "created_at" | "updated_at">): Promise<Batch> {
  const { data, error } = await dbClient
    .from("batches")
    .insert(payload)
    .select()
    .single();
  return mapBatch(assertOk(data, error));
}

export async function updateBatch(id: string, patch: Partial<DbBatch>): Promise<Batch> {
  const { data, error } = await dbClient
    .from("batches")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapBatch(assertOk(data, error));
}

// ── Brew Logs ──

export async function getBrewLogs(batchId: string): Promise<BrewLog[]> {
  const { data, error } = await dbClient
    .from("brew_logs")
    .select("*")
    .eq("batch_id", batchId)
    .order("created_at");
  return assertOk(data, error).map(mapBrewLog);
}

export async function getBrewLog(id: string): Promise<BrewLog> {
  const { data, error } = await dbClient
    .from("brew_logs")
    .select("*")
    .eq("id", id)
    .single();
  return mapBrewLog(assertOk(data, error));
}

export async function createBrewLog(payload: Omit<DbBrewLog, "id" | "created_at" | "updated_at">): Promise<BrewLog> {
  const { data, error } = await dbClient
    .from("brew_logs")
    .insert(payload)
    .select()
    .single();
  return mapBrewLog(assertOk(data, error));
}

export async function updateBrewLog(id: string, patch: Partial<DbBrewLog>): Promise<BrewLog> {
  const { data, error } = await dbClient
    .from("brew_logs")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapBrewLog(assertOk(data, error));
}

// ── Lots ──

export async function getLots(breweryId: string): Promise<Lot[]> {
  const { data, error } = await dbClient
    .from("lots")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("created_at", { ascending: false });
  return assertOk(data, error).map(mapLot);
}

export async function getLotsByBatch(batchId: string): Promise<Lot[]> {
  const { data, error } = await dbClient
    .from("lots")
    .select("*")
    .eq("batch_id", batchId)
    .order("created_at");
  return assertOk(data, error).map(mapLot);
}

export async function getLot(id: string): Promise<Lot> {
  const { data, error } = await dbClient
    .from("lots")
    .select("*")
    .eq("id", id)
    .single();
  return mapLot(assertOk(data, error));
}

export async function createLot(payload: Omit<DbLot, "id" | "created_at" | "updated_at">): Promise<Lot> {
  const { data, error } = await dbClient
    .from("lots")
    .insert(payload)
    .select()
    .single();
  return mapLot(assertOk(data, error));
}

export async function updateLot(id: string, patch: Partial<DbLot>): Promise<Lot> {
  const { data, error } = await dbClient
    .from("lots")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapLot(assertOk(data, error));
}

// ── Sales ──

export async function getSales(breweryId: string): Promise<Sale[]> {
  const { data, error } = await dbClient
    .from("sales")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("sale_date", { ascending: false });
  return assertOk(data, error).map(mapSale);
}

export async function getSale(id: string): Promise<Sale> {
  const { data, error } = await dbClient
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();
  return mapSale(assertOk(data, error));
}

export async function createSale(payload: Omit<DbSale, "id" | "created_at" | "updated_at">): Promise<Sale> {
  const { data, error } = await dbClient
    .from("sales")
    .insert(payload)
    .select()
    .single();
  return mapSale(assertOk(data, error));
}

export async function updateSale(id: string, patch: Partial<DbSale>): Promise<Sale> {
  const { data, error } = await dbClient
    .from("sales")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapSale(assertOk(data, error));
}

// ── Declarations ──

export async function getDeclarations(breweryId: string): Promise<Declaration[]> {
  const { data, error } = await dbClient
    .from("declarations")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("period_start", { ascending: false });
  return assertOk(data, error).map(mapDeclaration);
}

export async function getDeclaration(id: string): Promise<Declaration> {
  const { data, error } = await dbClient
    .from("declarations")
    .select("*")
    .eq("id", id)
    .single();
  return mapDeclaration(assertOk(data, error));
}

export async function createDeclaration(payload: Omit<DbDeclaration, "id" | "created_at" | "updated_at">): Promise<Declaration> {
  const { data, error } = await dbClient
    .from("declarations")
    .insert(payload)
    .select()
    .single();
  return mapDeclaration(assertOk(data, error));
}

export async function updateDeclaration(id: string, patch: Partial<DbDeclaration>): Promise<Declaration> {
  const { data, error } = await dbClient
    .from("declarations")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapDeclaration(assertOk(data, error));
}

// ── Inventory Movements ──

export async function getInventoryMovements(breweryId: string, limit = 100): Promise<InventoryMovement[]> {
  const { data, error } = await dbClient
    .from("inventory_movements")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("movement_timestamp", { ascending: false })
    .limit(limit);
  return assertOk(data, error).map(mapInventoryMovement);
}

export async function createInventoryMovement(payload: Omit<DbInventoryMovement, "id" | "created_at">): Promise<InventoryMovement> {
  const { data, error } = await dbClient
    .from("inventory_movements")
    .insert(payload)
    .select()
    .single();
  return mapInventoryMovement(assertOk(data, error));
}

// ── Pending Movements ──

export async function getPendingMovements(breweryId: string): Promise<PendingMovement[]> {
  const { data, error } = await dbClient
    .from("pending_movements")
    .select("*")
    .eq("brewery_id", breweryId)
    .eq("resolution_status", "pending")
    .order("created_at", { ascending: false });
  return assertOk(data, error).map(mapPendingMovement);
}

export async function getPendingMovement(id: string): Promise<PendingMovement> {
  const { data, error } = await dbClient
    .from("pending_movements")
    .select("*")
    .eq("id", id)
    .single();
  return mapPendingMovement(assertOk(data, error));
}

export async function createPendingMovement(payload: Omit<DbPendingMovement, "id" | "created_at" | "updated_at">): Promise<PendingMovement> {
  const { data, error } = await dbClient
    .from("pending_movements")
    .insert(payload)
    .select()
    .single();
  return mapPendingMovement(assertOk(data, error));
}

export async function updatePendingMovement(id: string, patch: Partial<DbPendingMovement>): Promise<PendingMovement> {
  const { data, error } = await dbClient
    .from("pending_movements")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return mapPendingMovement(assertOk(data, error));
}

// ── Event Logs ──

export async function getEventLogs(breweryId: string, limit = 50): Promise<EventLog[]> {
  const { data, error } = await dbClient
    .from("event_logs")
    .select("*")
    .eq("brewery_id", breweryId)
    .order("event_timestamp", { ascending: false })
    .limit(limit);
  return assertOk(data, error).map(mapEventLog);
}

export async function logEvent(payload: Omit<DbEventLog, "id" | "created_at" | "event_timestamp">): Promise<void> {
  const { error } = await dbClient
    .from("event_logs")
    .insert(payload);
  if (error) console.error("[db] logEvent failed:", error.message);
}
