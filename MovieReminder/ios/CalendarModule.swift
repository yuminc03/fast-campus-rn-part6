import Foundation
import EventKit

@objc(CalendarModule)

class CalendarModule: NSObject {
  var store = EKEventStore()

  @objc func createCalendarEvent(
    _ timestampInSec: Double,
    title title: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if #available(iOS 17.0, *) {
      store.requestFullAccessToEvents { [weak self] granted, error in
        self?.createEvent(
          timestampInSec,
          title: title,
          resolver: resolve, 
          rejecter: reject,
          granted: granted,
          error: error
        )
      }
    } else {
      store.requestAccess(to: .event) { [weak self] granted, error in
        self?.createEvent(
          timestampInSec,
          title: title,
          resolver: resolve,
          rejecter: reject,
          granted: granted,
          error: error
        )
      }
    }
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc private func createEvent(
    _ timestampInSec: Double,
    title: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock,
    granted: Bool,
    error: (any Error)?
  ) {
    if (error != nil) {
      reject("permission_error", error?.localizedDescription, error)
      return
    }
    
    if (!granted) {
      reject("permision_denied", "Permission is denied", nil)
    }
    
    // permission is granted
    let event:EKEvent = EKEvent(eventStore: self.store)
    event.title = title
    event.startDate = Date(timeIntervalSince1970: timestampInSec)
    event.endDate = Date(timeIntervalSince1970: timestampInSec) // sec
    event.isAllDay = true
    event.calendar = self.store.defaultCalendarForNewEvents
    
    do {
      try self.store.save(event, span: .thisEvent)
      resolve(nil)
    } catch {
      reject("event_failure", error.localizedDescription, error)
    }
  }
}
