// @ts-nocheck
/**
 * Contoh: Arsitektur Controller & Service
 * Aturan Elite: Controller hanya sebagai tukang pos. Service sebagai otaknya.
 */

import { Request, Response } from 'express';

// ==========================================
// 1. SERVICE LAYER (Di sini tempat logika bisnis bersemayam)
// ==========================================
export class OrderService {
  constructor(private orderRepository: any, private paymentGateway: any) {}

  public async processCheckout(userId: string, cartId: string) {
    // 1. Ambil data (Logika Bisnis)
    const cart = await this.orderRepository.getCart(cartId);
    if (!cart) throw new Error('Cart Not Found');

    // 2. Kalkulasi berat (Logika Bisnis)
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);
    const finalAmount = totalAmount > 1000 ? totalAmount * 0.9 : totalAmount; // Diskon 10%

    // 3. Panggil pihak ketiga (Logika Bisnis)
    const paymentResult = await this.paymentGateway.charge(userId, finalAmount);
    
    return paymentResult;
  }
}

// ==========================================
// 2. CONTROLLER LAYER (DILARANG KERAS naruh logika kalkulasi di sini)
// ==========================================
export class OrderController {
  constructor(private orderService: OrderService) {}

  public checkoutHandler = async (req: Request, res: Response) => {
    try {
      // Validasi input DTO (Bisa pakai Zod)
      const { userId, cartId } = req.body;

      // Controller HANYA memanggil service
      const result = await this.orderService.processCheckout(userId, cartId);

      // Controller HANYA menyusun balasan (Response)
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      // Controller HANYA menangani error response
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
