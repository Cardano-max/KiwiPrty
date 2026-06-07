"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setSessionCookie, clearSessionCookie } from "@/server/auth";
import {
  loginWithOtp,
  registerCustomer,
  registerSupplier,
} from "@/server/services/account";
import { addToCart, updateCartItem, removeCartItem } from "@/server/services/cart";
import { checkout } from "@/server/services/orders";
import { setSupplierOrderStatus } from "@/server/services/orders";
import { createInquiry } from "@/server/services/inquiries";
import { createReview } from "@/server/services/reviews";
import { toggleFavorite } from "@/server/services/favorites";
import { activateMembership } from "@/server/services/subscriptions";
import { createStory } from "@/server/services/stories";
import { createProduct } from "@/server/services/suppliers";
import { setSupplierKyc, setCustomerKyc } from "@/server/services/admin";
import { getCustomerId, getSupplierId, isAdmin, errMsg } from "@/server/session";
import { getSession } from "@/server/auth";

const num = (v: FormDataEntryValue | null) => Number(v ?? 0);
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

// --- auth ---

export async function loginAction(formData: FormData) {
  const phone = str(formData.get("phone"));
  const otp = str(formData.get("otp"));
  const next = str(formData.get("next"));
  let dest = next || "/";
  try {
    const { user, token } = await loginWithOtp(phone, otp);
    await setSessionCookie(token);
    if (!next) dest = user.role === "supplier" ? "/supplier" : user.role === "admin" ? "/admin" : "/";
  } catch (e) {
    redirect(`/login?error=${encodeURIComponent(errMsg(e))}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }
  redirect(dest);
}

export async function registerAction(formData: FormData) {
  const role = str(formData.get("role")) || "customer";
  let dest = "/";
  try {
    if (role === "supplier") {
      const { token } = await registerSupplier({
        phone: str(formData.get("phone")),
        companyName: str(formData.get("companyName")),
        businessType: str(formData.get("businessType")) || "wholesaler",
        city: str(formData.get("city")),
        state: str(formData.get("state")),
        gstNumber: str(formData.get("gstNumber")),
      });
      await setSessionCookie(token);
      dest = "/supplier";
    } else {
      const { token } = await registerCustomer({
        phone: str(formData.get("phone")),
        shopName: str(formData.get("shopName")),
        ownerName: str(formData.get("ownerName")),
        city: str(formData.get("city")),
        state: str(formData.get("state")),
        businessCategory: str(formData.get("businessCategory")) || "party_shop",
        gstNumber: str(formData.get("gstNumber")),
      });
      await setSessionCookie(token);
      dest = "/";
    }
  } catch (e) {
    redirect(`/register?role=${role}&error=${encodeURIComponent(errMsg(e))}`);
  }
  redirect(dest);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

// --- cart ---

export async function addToCartAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const slug = str(formData.get("slug"));
  const quantity = num(formData.get("quantity"));
  const customerId = await getCustomerId();
  if (!customerId) redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
  let dest = "/cart";
  try {
    await addToCart(customerId as string, productId, quantity);
  } catch (e) {
    dest = `/products/${slug}?error=${encodeURIComponent(errMsg(e))}`;
  }
  revalidatePath("/cart");
  redirect(dest);
}

export async function updateCartAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const quantity = num(formData.get("quantity"));
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login");
  try {
    await updateCartItem(customerId as string, productId, quantity);
  } catch {
    /* keep page; validation message shown on next add */
  }
  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeCartAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login");
  await removeCartItem(customerId as string, productId);
  revalidatePath("/cart");
  redirect("/cart");
}

export async function checkoutAction() {
  const customerId = await getCustomerId();
  if (!customerId) redirect("/login?next=/cart");
  let dest = "/orders";
  try {
    const order = await checkout(customerId as string);
    if (order) dest = `/orders/${order.id}?placed=1`;
  } catch (e) {
    dest = `/cart?error=${encodeURIComponent(errMsg(e))}`;
  }
  revalidatePath("/orders");
  redirect(dest);
}

// --- inquiry ---

export async function inquiryAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const slug = str(formData.get("slug"));
  const message = str(formData.get("message"));
  const customerId = await getCustomerId();
  if (!customerId) redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
  try {
    await createInquiry(customerId as string, productId, message);
  } catch (e) {
    redirect(`/products/${slug}?error=${encodeURIComponent(errMsg(e))}`);
  }
  redirect(`/products/${slug}?inquiry=1`);
}

// --- supplier ---

export async function createProductAction(formData: FormData) {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/products/new");
  try {
    await createProduct(supplierId as string, {
      name: str(formData.get("name")),
      categoryId: str(formData.get("categoryId")),
      basePricePaise: Math.round(num(formData.get("price")) * 100),
      gstPercent: num(formData.get("gstPercent")) || 18,
      moq: num(formData.get("moq")) || 1,
      quantityMultiple: num(formData.get("quantityMultiple")) || 1,
      stockQuantity: num(formData.get("stockQuantity")) || 0,
      unitLabel: str(formData.get("unitLabel")) || "Piece",
      serviceCity: str(formData.get("serviceCity")),
      description: str(formData.get("description")),
      color: str(formData.get("color")),
      material: str(formData.get("material")),
      imageUrl: str(formData.get("imageUrl")),
    });
  } catch (e) {
    redirect(`/supplier/products/new?error=${encodeURIComponent(errMsg(e))}`);
  }
  revalidatePath("/supplier");
  redirect("/supplier?created=1");
}

export async function setOrderStatusAction(formData: FormData) {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login");
  const supplierOrderId = str(formData.get("supplierOrderId"));
  const status = str(formData.get("status"));
  try {
    await setSupplierOrderStatus(supplierOrderId, supplierId as string, status);
  } catch {
    /* ignore */
  }
  revalidatePath("/supplier/orders");
  redirect("/supplier/orders");
}

// --- membership ---

export async function subscribeAction() {
  const s = await getSession();
  if (!s) redirect("/login?next=/pricing");
  if (s.role !== "customer" && s.role !== "supplier") redirect("/pricing");
  try {
    await activateMembership(s.userId, s.role);
  } catch (e) {
    redirect(`/pricing?error=${encodeURIComponent(errMsg(e))}`);
  }
  revalidatePath("/pricing");
  redirect("/pricing?subscribed=1");
}

// --- wishlist ---

export async function toggleFavoriteAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const redirectTo = str(formData.get("redirectTo")) || "/wishlist";
  const customerId = await getCustomerId();
  if (!customerId) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  await toggleFavorite(customerId as string, productId);
  revalidatePath(redirectTo);
  revalidatePath("/wishlist");
  redirect(redirectTo);
}

// --- reviews ---

export async function createReviewAction(formData: FormData) {
  const productId = str(formData.get("productId"));
  const slug = str(formData.get("slug"));
  const rating = num(formData.get("rating"));
  const text = str(formData.get("text"));
  const customerId = await getCustomerId();
  if (!customerId) redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
  try {
    await createReview(customerId as string, productId, rating, text);
  } catch (e) {
    redirect(`/products/${slug}?error=${encodeURIComponent(errMsg(e))}`);
  }
  revalidatePath(`/products/${slug}`);
  redirect(`/products/${slug}?reviewed=1`);
}

// --- stories ---

export async function createStoryAction(formData: FormData) {
  const supplierId = await getSupplierId();
  if (!supplierId) redirect("/login?next=/supplier/stories");
  try {
    await createStory(supplierId as string, {
      type: str(formData.get("type")) || "product",
      mediaUrl: str(formData.get("mediaUrl")),
      caption: str(formData.get("caption")),
      linkedProductId: str(formData.get("linkedProductId")),
      offerText: str(formData.get("offerText")),
      isHighlight: str(formData.get("isHighlight")) === "on",
    });
  } catch (e) {
    redirect(`/supplier/stories?error=${encodeURIComponent(errMsg(e))}`);
  }
  revalidatePath("/supplier/stories");
  revalidatePath("/stories");
  redirect("/supplier/stories?created=1");
}

export async function storyInquiryAction(formData: FormData) {
  const storyId = str(formData.get("storyId"));
  const productId = str(formData.get("productId"));
  const message = str(formData.get("message"));
  const customerId = await getCustomerId();
  if (!customerId) redirect(`/login?next=${encodeURIComponent(`/stories/${storyId}`)}`);
  try {
    await createInquiry(customerId as string, productId, message, "in_app", storyId);
  } catch (e) {
    redirect(`/stories/${storyId}?error=${encodeURIComponent(errMsg(e))}`);
  }
  redirect(`/stories/${storyId}?inquiry=1`);
}

// --- admin ---

export async function adminKycAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/login");
  const s = await getSession();
  const kind = str(formData.get("kind")); // supplier | customer
  const id = str(formData.get("id"));
  const decision = str(formData.get("decision")); // approved | rejected
  if (kind === "supplier") {
    await setSupplierKyc(id, decision, s?.userId);
  } else {
    await setCustomerKyc(id, decision, s?.userId);
  }
  revalidatePath("/admin");
  redirect("/admin");
}
