import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  CheckoutSessionResponse,
  PaymentRequest,
  PayuBackendContract,
  TransactionTypeOption
} from '../../models/payment.model';
import { PaymentsService } from '../../services/payments.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  paymentForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  checkoutResponse: CheckoutSessionResponse | null = null;
  transactionTypes: TransactionTypeOption[] = [];
  backendContract!: PayuBackendContract;

  constructor(
    private fb: FormBuilder,
    private paymentsService: PaymentsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.transactionTypes = this.paymentsService.getTransactionTypeOptions();
    this.backendContract = this.paymentsService.getBackendContract();

    this.paymentForm = this.fb.group({
      reference: [this.paymentsService.buildReference(), Validators.required],
      description: ['Pago de venta PoliMarket', [Validators.required, Validators.maxLength(120)]],
      amount: [100000, [Validators.required, Validators.min(1000)]],
      currency: [environment.payu.currency, Validators.required],
      transactionType: [this.transactionTypes[0]?.value, Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      document: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      returnUrl: [environment.payu.responseUrl, Validators.required],
      confirmationUrl: [environment.payu.confirmationUrl, Validators.required]
    });

    this.handlePayuReturnParams();
  }

  get f() {
    return this.paymentForm.controls;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.checkoutResponse = null;

    const formValue = this.paymentForm.value;
    const request: PaymentRequest = {
      reference: formValue.reference,
      description: formValue.description,
      amount: Number(formValue.amount),
      currency: formValue.currency,
      transactionType: formValue.transactionType,
      payer: {
        fullName: formValue.fullName,
        email: formValue.email,
        document: formValue.document,
        phone: formValue.phone
      },
      returnUrl: formValue.returnUrl,
      confirmationUrl: formValue.confirmationUrl
    };

    this.paymentsService.createCheckoutSession(request).subscribe({
      next: (response) => {
        this.checkoutResponse = response;
        this.success = response.message || 'Sesion de pago creada correctamente';
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.message || 'No fue posible iniciar el flujo de pago';
        this.loading = false;
      }
    });
  }

  openCheckout(): void {
    if (this.checkoutResponse?.redirectUrl) {
      window.open(this.checkoutResponse.redirectUrl, '_blank', 'noopener,noreferrer');
    }
  }

  regenerateReference(): void {
    this.paymentForm.patchValue({
      reference: this.paymentsService.buildReference()
    });
  }

  private handlePayuReturnParams(): void {
    this.route.queryParams.subscribe((params) => {
      const reference = params['referenceCode'];
      const state = params['lapTransactionState'];
      const message = params['message'];

      if (!reference && !state && !message) {
        return;
      }

      if (reference) {
        this.paymentForm.patchValue({ reference });
      }

      const normalizedState = (state || '').toString().toUpperCase();

      if (normalizedState === 'APPROVED' || normalizedState === '4') {
        this.success = `Pago aprobado para referencia ${reference || 'N/A'}`;
        this.error = '';
      } else if (normalizedState) {
        this.error = `Estado de pago: ${normalizedState}. ${message || ''}`.trim();
        this.success = '';
      }
    });
  }
}
