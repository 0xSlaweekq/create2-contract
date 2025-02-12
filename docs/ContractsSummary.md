Summary
 - [locked-ether](#locked-ether) (3 results) (Medium)
 - [uninitialized-local](#uninitialized-local) (1 results) (Medium)
 - [unused-return](#unused-return) (2 results) (Medium)
 - [calls-loop](#calls-loop) (3 results) (Low)
 - [reentrancy-events](#reentrancy-events) (2 results) (Low)
 - [assembly](#assembly) (4 results) (Informational)
 - [low-level-calls](#low-level-calls) (1 results) (Informational)
 - [missing-inheritance](#missing-inheritance) (1 results) (Informational)
 - [naming-convention](#naming-convention) (6 results) (Informational)
 - [too-many-digits](#too-many-digits) (4 results) (Informational)
## locked-ether
Impact: Medium
Confidence: High
 - [ ] ID-0
Contract locking ether found:
	Contract [UpgradeableProxy](contracts/common/UpgradeableProxy.sol#L12-L68) has payable functions:
	 - [UpgradeableProxy.receive()](contracts/common/UpgradeableProxy.sol#L19-L21)
	 - [UpgradeableProxy.fallback()](contracts/common/UpgradeableProxy.sol#L27-L30)
	But does not have a function to withdraw the ether

contracts/common/UpgradeableProxy.sol#L12-L68


 - [ ] ID-1
Contract locking ether found:
	Contract [UniversalFactory](contracts/common/UniversalFactory.sol#L25-L111) has payable functions:
	 - [UniversalFactory.receive()](contracts/common/UniversalFactory.sol#L45-L47)
	But does not have a function to withdraw the ether

contracts/common/UniversalFactory.sol#L25-L111


 - [ ] ID-2
Contract locking ether found:
	Contract [TronUniversalFactory](contracts/common/TronUniversalFactory.sol#L24-L110) has payable functions:
	 - [TronUniversalFactory.receive()](contracts/common/TronUniversalFactory.sol#L44-L46)
	But does not have a function to withdraw the ether

contracts/common/TronUniversalFactory.sol#L24-L110


## uninitialized-local
Impact: Medium
Confidence: Medium
 - [ ] ID-3
[LibAdmin._updateField(address,LibAdmin.Field).oldValue](contracts/utils/LibAdmin.sol#L110) is a local variable never initialized

contracts/utils/LibAdmin.sol#L110


## unused-return
Impact: Medium
Confidence: Medium
 - [ ] ID-4
[TronUniversalFactory.createClone(bytes32)](contracts/common/TronUniversalFactory.sol#L54-L66) ignores return value by [UpgradeableProxy(address(cloneAddress)).initProxy(msg.sender,address(this),withdrawal_)](contracts/common/TronUniversalFactory.sol#L62)

contracts/common/TronUniversalFactory.sol#L54-L66


 - [ ] ID-5
[UniversalFactory.createClone(bytes32)](contracts/common/UniversalFactory.sol#L55-L67) ignores return value by [UpgradeableProxy(address(cloneAddress)).initProxy(msg.sender,address(this),withdrawal_)](contracts/common/UniversalFactory.sol#L63)

contracts/common/UniversalFactory.sol#L55-L67


## calls-loop
Impact: Low
Confidence: Medium
 - [ ] ID-6
[UniversalFactory.withdrawAssetsFromClones(address[],uint256[],address,address)](contracts/common/UniversalFactory.sol#L77-L101) has external calls inside a loop: [success = IWithdrawable(cloneAddress).withdrawFactory(token,recipient,amounts[i])](contracts/common/UniversalFactory.sol#L91-L95)

contracts/common/UniversalFactory.sol#L77-L101


 - [ ] ID-7
[UniversalWithdrawal._withdrawERC20(address,address,uint256)](contracts/common/UniversalWithdrawal.sol#L173-L181) has external calls inside a loop: [(success,result) = token.call(abi.encodeWithSignature(transfer(address,uint256),to,amount))](contracts/common/UniversalWithdrawal.sol#L177-L179)

contracts/common/UniversalWithdrawal.sol#L173-L181


 - [ ] ID-8
[TronUniversalFactory.withdrawAssetsFromClones(address[],uint256[],address,address)](contracts/common/TronUniversalFactory.sol#L76-L100) has external calls inside a loop: [success = IWithdrawable(cloneAddress).withdrawFactory(token,recipient,amounts[i])](contracts/common/TronUniversalFactory.sol#L90-L94)

contracts/common/TronUniversalFactory.sol#L76-L100


## reentrancy-events
Impact: Low
Confidence: Medium
 - [ ] ID-9
Reentrancy in [UniversalFactory.createClone(bytes32)](contracts/common/UniversalFactory.sol#L55-L67):
	External calls:
	- [UpgradeableProxy(address(cloneAddress)).initProxy(msg.sender,address(this),withdrawal_)](contracts/common/UniversalFactory.sol#L63)
	Event emitted after the call(s):
	- [CloneCreated(cloneAddress,withdrawal_,owner())](contracts/common/UniversalFactory.sol#L66)

contracts/common/UniversalFactory.sol#L55-L67


 - [ ] ID-10
Reentrancy in [TronUniversalFactory.createClone(bytes32)](contracts/common/TronUniversalFactory.sol#L54-L66):
	External calls:
	- [UpgradeableProxy(address(cloneAddress)).initProxy(msg.sender,address(this),withdrawal_)](contracts/common/TronUniversalFactory.sol#L62)
	Event emitted after the call(s):
	- [CloneCreated(cloneAddress,withdrawal_,owner())](contracts/common/TronUniversalFactory.sol#L65)

contracts/common/TronUniversalFactory.sol#L54-L66


## assembly
Impact: Informational
Confidence: High
 - [ ] ID-11
[UpgradeableProxy._delegate()](contracts/common/UpgradeableProxy.sol#L51-L67) uses assembly
	- [INLINE ASM](contracts/common/UpgradeableProxy.sol#L55-L66)

contracts/common/UpgradeableProxy.sol#L51-L67


 - [ ] ID-12
[TronClones.predictDeterministicAddress(address,bytes32,address)](contracts/utils/TronClones.sol#L16-L32) uses assembly
	- [INLINE ASM](contracts/utils/TronClones.sol#L22-L31)

contracts/utils/TronClones.sol#L16-L32


 - [ ] ID-13
[LibAdmin._storage()](contracts/utils/LibAdmin.sol#L189-L194) uses assembly
	- [INLINE ASM](contracts/utils/LibAdmin.sol#L191-L193)

contracts/utils/LibAdmin.sol#L189-L194


 - [ ] ID-14
[TronClones.cloneDeterministic(address,bytes32)](contracts/utils/TronClones.sol#L5-L14) uses assembly
	- [INLINE ASM](contracts/utils/TronClones.sol#L6-L12)

contracts/utils/TronClones.sol#L5-L14


## low-level-calls
Impact: Informational
Confidence: High
 - [ ] ID-15
Low level call in [UniversalWithdrawal._withdrawERC20(address,address,uint256)](contracts/common/UniversalWithdrawal.sol#L173-L181):
	- [(success,result) = token.call(abi.encodeWithSignature(transfer(address,uint256),to,amount))](contracts/common/UniversalWithdrawal.sol#L177-L179)

contracts/common/UniversalWithdrawal.sol#L173-L181


## missing-inheritance
Impact: Informational
Confidence: High
 - [ ] ID-16
[UniversalWithdrawal](contracts/common/UniversalWithdrawal.sol#L17-L182) should inherit from [IWithdrawable](contracts/common/TronUniversalFactory.sol#L8-L17)

contracts/common/UniversalWithdrawal.sol#L17-L182


## naming-convention
Impact: Informational
Confidence: High
 - [ ] ID-17
Parameter [TronUniversalFactory.createClone(bytes32)._salt](contracts/common/TronUniversalFactory.sol#L54) is not in mixedCase

contracts/common/TronUniversalFactory.sol#L54


 - [ ] ID-18
Variable [TronUniversalFactory.PROXY](contracts/common/TronUniversalFactory.sol#L28) is not in mixedCase

contracts/common/TronUniversalFactory.sol#L28


 - [ ] ID-19
Parameter [TronUniversalFactory.predictAddress(bytes32)._salt](contracts/common/TronUniversalFactory.sol#L107) is not in mixedCase

contracts/common/TronUniversalFactory.sol#L107


 - [ ] ID-20
Parameter [UniversalFactory.predictAddress(bytes32)._salt](contracts/common/UniversalFactory.sol#L108) is not in mixedCase

contracts/common/UniversalFactory.sol#L108


 - [ ] ID-21
Variable [UniversalFactory.PROXY](contracts/common/UniversalFactory.sol#L29) is not in mixedCase

contracts/common/UniversalFactory.sol#L29


 - [ ] ID-22
Parameter [UniversalFactory.createClone(bytes32)._salt](contracts/common/UniversalFactory.sol#L55) is not in mixedCase

contracts/common/UniversalFactory.sol#L55


## too-many-digits
Impact: Informational
Confidence: Medium
 - [ ] ID-23
[TronClones.predictDeterministicAddress(address,bytes32,address)](contracts/utils/TronClones.sol#L16-L32) uses literals with too many digits:
	- [mstore(uint256,uint256)(ptr_predictDeterministicAddress_asm_0,0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)](contracts/utils/TronClones.sol#L24)

contracts/utils/TronClones.sol#L16-L32


 - [ ] ID-24
[TronClones.cloneDeterministic(address,bytes32)](contracts/utils/TronClones.sol#L5-L14) uses literals with too many digits:
	- [mstore(uint256,uint256)(ptr_cloneDeterministic_asm_0,0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)](contracts/utils/TronClones.sol#L8)

contracts/utils/TronClones.sol#L5-L14


 - [ ] ID-25
[TronClones.predictDeterministicAddress(address,bytes32,address)](contracts/utils/TronClones.sol#L16-L32) uses literals with too many digits:
	- [mstore(uint256,uint256)(ptr_predictDeterministicAddress_asm_0 + 0x28,0x5af43d82803e903d91602b57fd5bf34100000000000000000000000000000000)](contracts/utils/TronClones.sol#L26)

contracts/utils/TronClones.sol#L16-L32


 - [ ] ID-26
[TronClones.cloneDeterministic(address,bytes32)](contracts/utils/TronClones.sol#L5-L14) uses literals with too many digits:
	- [mstore(uint256,uint256)(ptr_cloneDeterministic_asm_0 + 0x28,0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)](contracts/utils/TronClones.sol#L10)

contracts/utils/TronClones.sol#L5-L14


