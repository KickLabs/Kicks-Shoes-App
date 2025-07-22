import discountService from "@/services/discount";

export interface DiscountTestResult {
  code: string;
  isValid: boolean;
  discount?: any;
  discountAmount: number;
  finalTotal: number;
  message: string;
  cartTotal: number;
}

class DiscountTester {
  /**
   * Test a specific discount code with API
   */
  async testDiscountCode(
    code: string,
    cartTotal: number,
    cartItems: any[] = []
  ): Promise<DiscountTestResult> {
    console.log(
      `🎯 Testing discount code: ${code} with cart total: ₫${cartTotal.toLocaleString()}`
    );

    try {
      const result = await discountService.validateDiscount({
        code,
        cartTotal,
        cartItems:
          cartItems.length > 0
            ? cartItems
            : [
                {
                  id: "test1",
                  productId: "test1",
                  name: "Test Product",
                  price: cartTotal,
                  quantity: 1,
                },
              ],
      });

      const testResult: DiscountTestResult = {
        code,
        isValid: result.isValid,
        discount: result.discount,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        message: result.message,
        cartTotal,
      };

      console.log("🎯 Test result:", testResult);
      return testResult;
    } catch (error: any) {
      const testResult: DiscountTestResult = {
        code,
        isValid: false,
        discountAmount: 0,
        finalTotal: cartTotal,
        message: `Error: ${error.message}`,
        cartTotal,
      };

      console.log("🎯 Test result (error):", testResult);
      return testResult;
    }
  }

  /**
   * Test multiple discount codes
   */
  async testMultipleCodes(
    codes: string[],
    cartTotal: number,
    cartItems: any[] = []
  ): Promise<DiscountTestResult[]> {
    console.log(
      `🧪 Testing ${codes.length} discount codes with cart total: ₫${cartTotal.toLocaleString()}`
    );

    const results: DiscountTestResult[] = [];

    for (const code of codes) {
      try {
        const result = await this.testDiscountCode(code, cartTotal, cartItems);
        results.push(result);
      } catch (error: any) {
        results.push({
          code,
          isValid: false,
          discountAmount: 0,
          finalTotal: cartTotal,
          message: `Error: ${error.message}`,
          cartTotal,
        });
      }
    }

    this.logTestResults(results);
    return results;
  }

  /**
   * Log test results in a formatted way
   */
  private logTestResults(results: DiscountTestResult[]): void {
    console.log("\n📊 DISCOUNT TEST RESULTS");
    console.log("=".repeat(50));

    const validResults = results.filter((r) => r.isValid);
    const invalidResults = results.filter((r) => !r.isValid);

    console.log(`✅ Valid codes: ${validResults.length}`);
    console.log(`❌ Invalid codes: ${invalidResults.length}`);

    if (validResults.length > 0) {
      console.log("\n✅ VALID DISCOUNTS:");
      validResults.forEach((result) => {
        console.log(
          `  🎫 ${result.code}: ${result.discount?.percentage || result.discount?.value || 0}% off`
        );
        console.log(
          `     💰 Saves: ₫${result.discountAmount.toLocaleString()}`
        );
        console.log(
          `     💳 Final total: ₫${result.finalTotal.toLocaleString()}`
        );
        console.log(`     📝 ${result.message}`);
      });
    }

    if (invalidResults.length > 0) {
      console.log("\n❌ INVALID CODES:");
      invalidResults.forEach((result) => {
        console.log(`  🎫 ${result.code}: ${result.message}`);
      });
    }

    console.log("=".repeat(50));
  }

  /**
   * Format VND currency
   */
  formatCurrency(amount: number): string {
    return `₫${amount.toLocaleString("vi-VN")}`;
  }
}

export const discountTester = new DiscountTester();
export default discountTester;
