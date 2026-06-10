import { reportsRepository } from "./reports.repository.js";
import {
  AdminReportQueryDto,
  AdminReportsDataDto,
  ReportCompareMode,
  ReportPeriodDto,
  ReportTimeRange,
} from "./reports.types.js";
import { getCompareLabel, getTrendDirection, calculateGrowthPercent, formatCompactVnd, formatPercent, calculatePercentage } from "./report-trend.calculator.js";
import { getCurrentPeriod, getPreviousPeriod } from "./report-period.factory.js";

export const reportsService = {
  getAdminReports: async (query: AdminReportQueryDto): Promise<AdminReportsDataDto> => {
    const currentPeriod = getCurrentPeriod(query.timeRange, query.fromDate, query.toDate);
    const previousPeriod = getPreviousPeriod(currentPeriod, query.compareMode);
    const showCompare = query.compareMode !== "NONE" && previousPeriod !== null;
    const compareLabel = getCompareLabel(query.compareMode);

    // Prepare helper to create metric trend object
    const getTrend = (currentValue: number, previousValue: number | undefined) => {
      if (!showCompare || previousValue === undefined) return undefined;
      const growth = calculateGrowthPercent(currentValue, previousValue);
      if (growth === null) return undefined;
      return {
        value: Math.abs(growth),
        direction: getTrendDirection(growth),
        label: compareLabel
      };
    };

    // Fire all queries concurrently
    const [
      [currRev, prevRev],
      [currTrend, prevTrend],
      [currSources, prevSources],
      [currGroom, prevGroom, groomStatus, groomTop],
      [currBoarding, prevBoarding, boardingStatus, boardingRoom],
      [currMedical, prevMedical, aptStatus, examTypes, docPerf],
      [currCust, prevCust, roleCounts, petCounts, accStatusCounts]
    ] = await Promise.all([
      // Revenue
      Promise.all([
        reportsRepository.getPaidRevenueSummary(currentPeriod, query.paymentMethodGroup),
        showCompare ? reportsRepository.getPaidRevenueSummary(previousPeriod, query.paymentMethodGroup) : null
      ]),
      Promise.all([
        reportsRepository.getRevenueTrend(currentPeriod, query.groupBy, query.paymentMethodGroup),
        showCompare ? reportsRepository.getRevenueTrend(previousPeriod, query.groupBy, query.paymentMethodGroup) : null
      ]),
      Promise.all([
        reportsRepository.getRevenueSourceBreakdown(currentPeriod, query.paymentMethodGroup),
        showCompare ? reportsRepository.getRevenueSourceBreakdown(previousPeriod, query.paymentMethodGroup) : null
      ]),
      // Services
      Promise.all([
        reportsRepository.getGroomingSummary(currentPeriod),
        showCompare ? reportsRepository.getGroomingSummary(previousPeriod) : null,
        reportsRepository.getGroomingStatusCounts(currentPeriod),
        reportsRepository.getTopGroomingServices(currentPeriod)
      ]),
      // Boarding
      Promise.all([
        reportsRepository.getBoardingSummary(currentPeriod),
        showCompare ? reportsRepository.getBoardingSummary(previousPeriod) : null,
        reportsRepository.getBoardingStatusCounts(currentPeriod),
        reportsRepository.getBoardingRoomOccupancy(currentPeriod)
      ]),
      // Medical
      Promise.all([
        reportsRepository.getMedicalSummary(currentPeriod),
        showCompare ? reportsRepository.getMedicalSummary(previousPeriod) : null,
        reportsRepository.getAppointmentStatusCounts(currentPeriod),
        reportsRepository.getExamTypeCounts(currentPeriod),
        reportsRepository.getDoctorPerformance(currentPeriod)
      ]),
      // Customers
      Promise.all([
        reportsRepository.getCustomerPetSummary(currentPeriod),
        showCompare ? reportsRepository.getCustomerPetSummary(previousPeriod) : null,
        reportsRepository.getUserRoleCounts(),
        reportsRepository.getPetSpeciesCounts(),
        reportsRepository.getAccountStatusCounts()
      ])
    ]);

    const revenueMetrics = [
      {
        id: "total_revenue",
        label: "Doanh thu đã thanh toán",
        value: formatCompactVnd(Number(currRev.current_paid_revenue)),
        rawValue: Number(currRev.current_paid_revenue),
        trend: getTrend(Number(currRev.current_paid_revenue), prevRev ? Number(prevRev.current_paid_revenue) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "success_transactions",
        label: "Giao dịch thành công",
        value: Number(currRev.current_successful_transactions).toString(),
        rawValue: Number(currRev.current_successful_transactions),
        trend: getTrend(Number(currRev.current_successful_transactions), prevRev ? Number(prevRev.current_successful_transactions) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "avg_order_value",
        label: "Giá trị hóa đơn trung bình",
        value: formatCompactVnd(Number(currRev.current_successful_transactions) > 0 ? Number(currRev.current_paid_revenue) / Number(currRev.current_successful_transactions) : 0),
        rawValue: Number(currRev.current_successful_transactions) > 0 ? Number(currRev.current_paid_revenue) / Number(currRev.current_successful_transactions) : 0,
        trend: getTrend(
          Number(currRev.current_successful_transactions) > 0 ? Number(currRev.current_paid_revenue) / Number(currRev.current_successful_transactions) : 0,
          prevRev && Number(prevRev.current_successful_transactions) > 0 ? Number(prevRev.current_paid_revenue) / Number(prevRev.current_successful_transactions) : undefined
        ),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      }
    ];



    // Simply map trend by date index for now
    const revenueTrend = currTrend.map((t, idx) => {
      let label = new Date(t.date_bucket).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      if (query.groupBy === "WEEK") label = `Tuần ${idx + 1}`;
      if (query.groupBy === "MONTH") label = new Date(t.date_bucket).toLocaleDateString("vi-VN", { month: '2-digit', year: 'numeric' });
      
      return {
        label,
        revenue: Number(t.revenue),
        previousRevenue: prevTrend && prevTrend[idx] ? Number(prevTrend[idx].revenue) : undefined
      };
    });



    const sourceLabelMap: Record<string, string> = {
      medical_exam: "Khám bệnh",
      grooming: "Spa",
      boarding: "Lưu trú",
      prescription: "Đơn thuốc"
    };

    const sourceBreakdown = ["medical_exam", "grooming", "boarding", "prescription"].map(type => {
      const curr = currSources.find(s => s.source_type === type);
      const prev = prevSources?.find(s => s.source_type === type);
      
      const revenue = curr ? Number(curr.revenue) : 0;
      const prevRevenue = prev ? Number(prev.revenue) : 0;
      const changePercent = getTrend(revenue, prevRevenue)?.value;

      return {
        sourceType: type as any,
        label: sourceLabelMap[type],
        invoiceCount: curr ? Number(curr.invoice_count) : 0,
        revenue,
        percentage: calculatePercentage(revenue, Number(currRev.current_paid_revenue)),
        changePercent: showCompare ? (getTrend(revenue, prevRevenue) ? (revenue >= prevRevenue ? changePercent : -(changePercent || 0)) : null) : undefined
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Services

    const serviceMetrics = [
      {
        id: "total_bookings",
        label: "Tổng lượt đặt dịch vụ",
        value: Number(currGroom.total_bookings).toString(),
        rawValue: Number(currGroom.total_bookings),
        trend: getTrend(Number(currGroom.total_bookings), prevGroom ? Number(prevGroom.total_bookings) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "completion_rate",
        label: "Tỷ lệ hoàn thành",
        value: `${calculatePercentage(Number(currGroom.completed_count), Number(currGroom.total_bookings))}%`,
        rawValue: calculatePercentage(Number(currGroom.completed_count), Number(currGroom.total_bookings)),
        trend: getTrend(
          calculatePercentage(Number(currGroom.completed_count), Number(currGroom.total_bookings)),
          prevGroom ? calculatePercentage(Number(prevGroom.completed_count), Number(prevGroom.total_bookings)) : undefined
        ),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "service_revenue",
        label: "Doanh thu dịch vụ",
        value: formatCompactVnd(sourceBreakdown.find(s => s.sourceType === "grooming")?.revenue || 0),
        rawValue: sourceBreakdown.find(s => s.sourceType === "grooming")?.revenue || 0,
        trend: getTrend(
          sourceBreakdown.find(s => s.sourceType === "grooming")?.revenue || 0,
          showCompare ? (prevSources?.find(s => s.source_type === "grooming") ? Number(prevSources.find(s => s.source_type === "grooming")!.revenue) : 0) : undefined
        ),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      }
    ];

    const groomingStatusMap: Record<string, string> = {
      pending_payment: "Chờ thanh toán",
      pending: "Chờ tiếp nhận",
      waiting: "Chờ xử lý",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy"
    };

    const serviceStatusCounts = groomStatus.map(s => ({
      status: s.status,
      label: groomingStatusMap[s.status] || s.status,
      count: Number(s.count)
    }));

    const topServices = groomTop.map(s => ({
      serviceId: s.service_id,
      serviceName: s.service_name,
      bookingCount: Number(s.booking_count),
      completedCount: Number(s.completed_count),
      cancelledCount: Number(s.cancelled_count),
      revenue: Number(s.revenue),
      completionRate: calculatePercentage(Number(s.completed_count), Number(s.booking_count)),
      changePercent: undefined
    }));

    // Boarding

    const boardingMetrics = [
      {
        id: "total_stays",
        label: "Tổng lượt lưu trú",
        value: Number(currBoarding.total_stays).toString(),
        rawValue: Number(currBoarding.total_stays),
        trend: getTrend(Number(currBoarding.total_stays), prevBoarding ? Number(prevBoarding.total_stays) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "avg_duration",
        label: "Thời gian lưu trú trung bình",
        value: `${Number(currBoarding.avg_duration).toFixed(1)} ngày`,
        rawValue: Number(currBoarding.avg_duration),
        trend: getTrend(Number(currBoarding.avg_duration), prevBoarding ? Number(prevBoarding.avg_duration) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "boarding_revenue",
        label: "Doanh thu lưu trú",
        value: formatCompactVnd(sourceBreakdown.find(s => s.sourceType === "boarding")?.revenue || 0),
        rawValue: sourceBreakdown.find(s => s.sourceType === "boarding")?.revenue || 0,
        trend: getTrend(
          sourceBreakdown.find(s => s.sourceType === "boarding")?.revenue || 0,
          showCompare ? (prevSources?.find(s => s.source_type === "boarding") ? Number(prevSources.find(s => s.source_type === "boarding")!.revenue) : 0) : undefined
        ),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      }
    ];

    const boardingStatusMap: Record<string, string> = {
      pending_payment: "Chờ thanh toán",
      pending: "Chờ xác nhận",
      confirmed: "Chờ check-in",
      staying: "Đang lưu trú",
      checked_out: "Đã trả thú cưng",
      rejected: "Từ chối",
      cancelled: "Đã hủy"
    };

    const boardingStatusCounts = boardingStatus.map(s => ({
      status: s.status,
      label: boardingStatusMap[s.status] || s.status,
      count: Number(s.count)
    }));

    const roomOccupancy = boardingRoom.map(r => ({
      roomTypeId: r.room_type_id,
      roomTypeName: r.room_type_name,
      capacity: Number(r.capacity),
      currentOccupancy: Number(r.current_occupancy),
      availableSlots: Math.max(0, Number(r.capacity) - Number(r.current_occupancy)),
      occupancyRate: calculatePercentage(Number(r.current_occupancy), Number(r.capacity)),
      bookingCount: Number(r.booking_count),
      revenue: Number(r.revenue),
      changePercent: undefined
    }));

    // Medical

    const medicalMetrics = [
      {
        id: "total_appointments",
        label: "Tổng lịch khám",
        value: Number(currMedical.total_appointments).toString(),
        rawValue: Number(currMedical.total_appointments),
        trend: getTrend(Number(currMedical.total_appointments), prevMedical ? Number(prevMedical.total_appointments) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "total_exams",
        label: "Phiếu khám đã ghi nhận",
        value: Number(currMedical.total_exams).toString(),
        rawValue: Number(currMedical.total_exams),
        trend: getTrend(Number(currMedical.total_exams), prevMedical ? Number(prevMedical.total_exams) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "total_prescriptions",
        label: "Đơn thuốc đã kê",
        value: Number(currMedical.total_prescriptions).toString(),
        rawValue: Number(currMedical.total_prescriptions),
        trend: getTrend(Number(currMedical.total_prescriptions), prevMedical ? Number(prevMedical.total_prescriptions) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      }
    ];

    const aptStatusMap: Record<string, string> = {
      pending_payment: "Chờ thanh toán",
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      rejected: "Từ chối",
      cancelled: "Đã hủy"
    };

    const appointmentStatusCounts = aptStatus.map(s => ({
      status: s.status,
      label: aptStatusMap[s.status] || s.status,
      count: Number(s.count)
    }));

    const examTypeCounts = examTypes.map(e => ({
      status: e.label,
      label: e.label,
      count: Number(e.count)
    }));

    const doctorPerformance = docPerf.map(d => ({
      doctorId: d.doctor_id,
      doctorName: d.doctor_name,
      assignedAppointments: Number(d.assigned_appointments),
      medicalExamCount: Number(d.medical_exam_count),
      prescriptionCount: Number(d.prescription_count),
      completionRate: calculatePercentage(Number(d.medical_exam_count), Number(d.assigned_appointments)),
      changePercent: undefined
    }));

    // Customers

    const customerMetrics = [
      {
        id: "new_owners",
        label: "Chủ nuôi mới trong kỳ",
        value: Number(currCust.new_owners).toString(),
        rawValue: Number(currCust.new_owners),
        trend: getTrend(Number(currCust.new_owners), prevCust ? Number(prevCust.new_owners) : undefined),
        description: !showCompare ? "trong kỳ đã chọn" : undefined
      },
      {
        id: "active_accounts",
        label: "Tài khoản đang hoạt động",
        value: Number(currCust.active_accounts).toString(),
        rawValue: Number(currCust.active_accounts),
        trend: undefined,
        description: "tổng hiện có"
      },
      {
        id: "total_pets",
        label: "Tổng thú cưng",
        value: Number(currCust.total_pets).toString(),
        rawValue: Number(currCust.total_pets),
        trend: undefined,
        description: "tổng hiện có"
      }
    ];

    const roleMap: Record<string, string> = { Owner: "Chủ nuôi", Staff: "Nhân viên", Doctor: "Bác sĩ", Admin: "Quản trị viên" };
    const userRoleCounts = roleCounts.map(r => ({
      status: r.status,
      label: roleMap[r.status] || r.status,
      count: Number(r.count)
    }));

    const petSpeciesMap: Record<string, string> = { Dog: "Chó", Cat: "Mèo", Other: "Khác" };
    const petSpeciesCounts = petCounts.map(p => ({
      status: p.status,
      label: petSpeciesMap[p.status] || p.status,
      count: Number(p.count)
    }));

    const accStatusMap: Record<string, string> = { active: "Hoạt động", inactive: "Ngừng hoạt động", locked: "Bị khóa" };
    const accountStatusCounts = accStatusCounts.map(a => ({
      status: a.status,
      label: accStatusMap[a.status] || a.status,
      count: Number(a.count)
    }));

    return {
      filters: query,
      period: {
        current: currentPeriod,
        previous: previousPeriod
      },
      revenue: {
        metrics: revenueMetrics,
        trend: revenueTrend,
        sourceBreakdown
      },
      services: {
        metrics: serviceMetrics,
        statusCounts: serviceStatusCounts,
        topServices
      },
      boarding: {
        metrics: boardingMetrics,
        statusCounts: boardingStatusCounts,
        roomOccupancy
      },
      medical: {
        metrics: medicalMetrics,
        appointmentStatusCounts,
        examTypeCounts,
        doctorPerformance
      },
      customers: {
        metrics: customerMetrics,
        userRoleCounts,
        petSpeciesCounts,
        accountStatusCounts
      }
    };
  }
};
